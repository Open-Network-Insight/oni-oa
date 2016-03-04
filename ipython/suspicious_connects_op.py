import socket
import struct
import csv
import numpy as np
import sys, getopt
import os
from subprocess import call
from subprocess import check_output
from collections import Counter
def main():
    sdate = ''
    spath = '{0}/ipython/user/{1}/'
    scores_f = os.environ['DSOURCES']+"_scores.csv"
    userDir = ''
    topct = 500
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'hd:u:',["help", "date=", "user="])
    except getopt.GetoptError as err:
        print 'usage: python sctipt.py -d <20150807> -u <duxbury>'
        sys.exit(2)
    for opt,arg in opts:
        if opt in ('-h', '--help'):
            print 'usage: python sctipt.py -d <20150807> -u <duxbury>'
            sys.exit()
        elif opt in ('-d', '--date'):
            sdate = arg
        elif opt in ('-u', '--user'):
            userDir = arg
    spath = spath.format(userDir, sdate)
    scores_full_path = spath + scores_f
    
    print "Creating Edge Files..."
    conns_list = []
    with open(scores_full_path, 'rb') as f:
        reader = csv.reader(f,delimiter=',') 
        reader.next();
        for i,row in enumerate(reader):
            if i >= topct:
		break
	    if int(row[0]) < 3: # 3 is the don't care
                # get src ip and dst ip
                sip = row[2]
                dip = row[3]
                # get hour and date 2014-07-08 10:10:40
                
                hr = row[1].split(' ')[1].split(':')[0]
                dy = row[1].split(' ')[0].split('-')[2] 
                mh = row[1].split(' ')[0].split('-')[1] 
                mm = row[1].split(' ')[1].split(':')[1]
                #TODO: using netflow_avro table, this query should change - no more minute(), hour()
                # also, there are more columns to return           
                if (sip,dip,dy,hr,mm) not in conns_list:
		    conns_list.append(sip,dip,dy,hr,mm)		    
		    hivestr = (" \"set hive.cli.print.header=true; "
		    "SELECT treceived as tstart, "
		    "sip as srcip, "
		    "dip as dstip, "
		    "sport as sport, "
		    "dport as dport, "
		    "proto as proto, "
		    "flag as flags, "
		    "stos as TOS, "
		    "ibyt as bytes, "
		    "ipkt as pkts, "
		    "input as input, " 
		    "output as output, " 
		    "rip as rip "
		    "FROM {0}.{1} " 
		    "WHERE ( (sip=\'{2}\' AND dip=\'{3}\') OR (sip=\'{3}\' AND dip=\'{2}\') ) "
		    "AND m={4} AND d={5} AND h={6} "
		    "AND trminute={7} "
		    "SORT BY tstart LIMIT 100; \"  > {8}edge-{9}-{10}-{6}-{7}.tsv").format(os.environ['DBNAME'],
		    os.environ['DSOURCES'],sip,dip,mh,dy,hr,mm,spath,sip.replace(".","_"),dip.replace(".","_"))
       
		    print 'processing line ', i + 1
		    print hivestr
		    #call(["hive","-S","-e", hivestr])
		    check_output("hive -S -e " + hivestr, shell=True)

    print "Done Creating Edge Files..."

    print "\n Creating Chord Files..."
    srcdict = {}
    rowct = 1
    with open(scores_full_path, 'rb') as f:
        reader = csv.reader(f,delimiter=',') 
        reader.next();
	srcs = map(lambda line: line.split(',')[2],reader[:topct]) + map(lambda line: line.split(',')[3],reader[:topct])
	srcdict = dict(Counter(srcs)

    ipct = 1
    for ip in srcdict:
        rowct=1
        if srcdict[ip] > 1:
            dstdict = {}
            with open(scores_full_path, 'rb') as f:
                reader = csv.reader(f, delimiter=',')
                reader.next()
                for row in reader:
                    if ip == row[2]:
                        dstdict[row[3]]=row[3]
                    if ip == row[3]:
                        dstdict[row[2]]=row[2]
                    rowct += 1
                    if rowct == topct:
                        break

            if len(dstdict.keys()) > 1:
                dstip = "'%s',"*len(dstdict.keys()) % tuple(dstdict.keys())
		
		hivestr = (" \"set hive.cli.print.header=true; "
		"SELECT sip as srcip, "
		"dip as dstip, "
		"MAX(ibyt) as maxbyte, "
		"AVG(ibyt) as avgbyte, " 
		"MAX(ipkt) as maxpkt, "
		"AVG(ipkt) as avgpkt "
		"FROM {0}.{1} "
		"WHERE m={2} AND d={3} AND ( (sip=\'{4}\' AND dip IN({5}) "
		"OR sip IN({5}) AND dip=\'{4}\') ) "
		"GROUP BY sip,dip \"  > {6}chord-{7}.tsv").format(os.environ['DBNAME'],
		os.environ['DSOURCES'],mh,dy,ip,dstip[:-1],spath,ip.replace(".","_"))                  
                print 'processing line ',ipct
                print hivestr
                #call(["hive", "-S", "-e", hivestr])
                check_output("hive -S -e " + hivestr, shell=True)
        if ipct == topct:
            break
        ipct += 1

main()
