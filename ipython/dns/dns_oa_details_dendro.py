#!/bin/env python

import sys
import subprocess
import csv
from multiprocessing import Process
import time
import os

def main():

    # validate paramters.
    validate_parameters(sys.argv)

    # generate details and dendro.
    generate_details_dendro(sys.argv[1],sys.argv[2])

def generate_details_dendro(dns_scores,storage_path):

    # get dbname.
    with open('/etc/duxbay.conf') as conf:
        for line in  conf.readlines():
            if "DBNAME" in line:
                dbase=line.split("=")[1].strip('\n').replace("'","")
                break

    p1 = Process(target=generate_details, args=(dns_scores,dbase,storage_path,))
    p1.start()
    print "Starting dns details"

    p2 = Process(target=generate_dendro, args=(dns_scores,dbase,storage_path,))
    p2.start()
    print "Starting dns dendogram"

    p1.join()
    p2.join()

def generate_details(dns_scores,dbase,storage_path):

    dns_details_cmd = "python dns_suspicious_details.py {0} {1} {2}".format(dns_scores,dbase,storage_path)
    subprocess.call(dns_details_cmd,shell=True)

def generate_dendro(dns_scores,dbase,storage_path):

    dns_dendro_cmd = "python dns_suspicious_dendrogram.py {0} {1} {2}".format(dns_scores,dbase,storage_path)
    subprocess.call(dns_dendro_cmd,shell=True)

def validate_parameters(params):

    usage="usage dns_suspicious_details.py 'dns_scores.csv path' 'storage path' "
    if len(params) < 3:
        print usage
        sys.exit(1)

if __name__ == '__main__':
    main()
