#!/bin/env python

import sys
import subprocess
import time
import os
import csv
import datetime

def main():

    print sys.argv
    # get parameters.
    dns_scores = sys.argv[1]
    dbase = sys.argv[2]
    storage_path = sys.argv[3]

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
                get_details(dbase,dns_qry_name,year,month,day,storage_path,hh)

def get_details(dbase,dns_qry_name,year,month,day,storage_path,hh):

    limit = 250

    if not os.path.isfile("{0}edge-{1}_{2}_00.csv".format(storage_path,dns_qry_name,hh)):

        dns_details_qry = "hive -S -e \" set hive.cli.print.header=true; SELECT frame_time, frame_len, ip_dst,  ip_src, dns_qry_name, dns_qry_class, dns_qry_type, dns_qry_rcode , dns_a FROM {0}.dns WHERE y={1} AND m={2} AND d={3} AND dns_qry_name LIKE '%{4}%' AND h={7} LIMIT {5};\" | sed 's/[\\t]/,/g' > {6}edge-{4}_{7}_00.csv".format(dbase,year,month,day,dns_qry_name,limit,storage_path,hh)

        print dns_details_qry
        subprocess.call(dns_details_qry,shell=True)

def validate_parameters(params):

    usage="usage dns_suspicious_details.py"
    if len(params) < 3:
        print usage
        sys.exit(1)

if __name__== '__main__':
    main()
