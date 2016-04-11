#!/bin/env python

import sys
import subprocess
import time
import os
import csv

def main():

    # validate parameters date and dns_path
    validate_parameters(sys.argv)

    # get parameters.
    dns_scores = sys.argv[1]
    dbase = sys.argv[2]
    storage_path = sys.argv[3]

    with open(dns_scores,'rb') as dns_csv:
        rows = csv.reader(dns_csv, delimiter=',', quotechar='|')

        # remove headers.
        next(dns_csv)

        for row in rows:

            # get data to query
            date=row[0].split(" ")[0].split("/")
            year=date[2]
            month=date[0]
            day=date[1]
            ip_dst=row[2]

            get_dendro(dbase,ip_dst,year,month,day,storage_path)

def get_dendro(dbase,ip_dst,year,month,day,storage_path):

    if not os.path.isfile("{0}dendro-{1}.csv".format(storage_path,ip_dst)):

        dendro_qry = "hive -S -e \"SELECT dns_a, dns_qry_name, ip_dst FROM (SELECT susp.ip_dst, susp.dns_qry_name, susp.dns_a FROM {0}.dns as susp  WHERE susp.y={1} AND susp.m={2} AND susp.d={3}  AND susp.ip_dst='{4}' ) AS tmp GROUP BY dns_a, dns_qry_name, ip_dst;\" > {5}dendro-{4}.csv".format(dbase,year,month,day,ip_dst,storage_path)

        print dendro_qry
        subprocess.call(dendro_qry,shell=True)

def validate_parameters(params):

    usage="usage dns_suspicious_dendrogram.py "
    if len(params) < 3:
        print usage
        sys.exit(1)


if __name__ == '__main__':
    main()
