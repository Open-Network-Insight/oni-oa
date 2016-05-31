#!/bin/env python

import sys
import subprocess
import time
import os
import csv
import datetime
import json
from iana import iana_transform

script_path = os.path.dirname(os.path.abspath(__file__))
iana_config_file = "{0}/iana/iana_config.json".format(script_path)
def main():

    print sys.argv
    
    # get parameters.
    dns_scores = sys.argv[1]
    dbase = sys.argv[2]
    storage_path = sys.argv[3]
    impala_node = sys.argv[4]

    with open(dns_scores,'rb') as dns_csv:
        rows = csv.reader(dns_csv, delimiter=',', quotechar='|')
        next(dns_csv)
        for row in rows:

            # get data to query
            date=row[0].split(" ")
            if len(date) == 5:
                year=date[2]
                month=datetime.datetime.strptime(date[0], '%b').strftime('%m')
                day=date[1]
                dns_qry_name=row[3]
                hh=row[16]
                get_details(dbase,dns_qry_name,year,month,day,storage_path,hh,impala_node)

def get_details(dbase,dns_qry_name,year,month,day,storage_path,hh,impala_node):

    limit = 250
    edge_file ="{0}edge-{1}_{2}_00.csv".format(storage_path,dns_qry_name,hh)
    edge_tmp  ="{0}edge-{1}_{2}_00.tmp".format(storage_path,dns_qry_name,hh)

    if not os.path.isfile(edge_file):
        
        dns_details_qry = ("SELECT frame_time,frame_len,ip_dst,ip_src,dns_qry_name,dns_qry_class,dns_qry_type,dns_qry_rcode,dns_a FROM {0}.dns WHERE y={1} AND m={2} AND d={3} AND dns_qry_name LIKE \"%{4}%\" AND h={6} LIMIT {5};").format(dbase,year,month,day,dns_qry_name,limit,hh)        
        
        impala_cmd = "impala-shell -i {0} --print_header -B --output_delimiter='\\t' -q '{1}' -o {2}".format(impala_node,dns_details_qry,edge_tmp)
        print impala_cmd
        subprocess.call(impala_cmd,shell=True)

        print "Adding IANA code....."
        iana_config = json.load(open(iana_config_file))
        iana = iana_transform.IanaTransform(iana_config["IANA"])

        with open(edge_tmp) as dns_details_csv:
            rows = csv.reader(dns_details_csv, delimiter=',', quotechar='|')
            next(dns_details_csv)
            update_rows = [add_iana_code(row,iana) for row in rows]
            update_rows = filter(None, update_rows)
            header = [ "frame_time", "frame_len", "ip_dst","ip_src","dns_qry_name","dns_qry_class_name","dns_qry_type_name","dns_qry_rcode_name","dns_a" ]
            update_rows.insert(0,header)
            print update_rows

        with open(edge_file,'wb') as dns_details_edge:
            writer = csv.writer(dns_details_edge, quoting=csv.QUOTE_ALL)
            print update_rows
            writer.writerows(update_rows)
        try:
            os.remove(edge_tmp)
        except OSError:
            pass


def add_iana_code(row,iana):

    if len(row) == 9:
        qry_class = row[5]
        qry_type = row[6]
        qry_rcode = row[7]
        COL_RCODE = 'dns_qry_rcode'
        COL_TYPE = 'dns_qry_type'
        COL_CLASS = 'dns_qry_class'
        qry_class_name = iana.get_name(qry_class, COL_CLASS)
        qry_type_name = iana.get_name(qry_type, COL_TYPE)
        qry_rcode_name = iana.get_name(qry_rcode, COL_RCODE)
        row[5] = qry_class_name
        row[6] = qry_type_name
        row[7] = qry_rcode_name
        return row

def validate_parameters(params):

    usage="usage dns_suspicious_details.py"
    if len(params) < 3:
        print usage
        sys.exit(1)

if __name__== '__main__':
    main()
