import socket
import struct
import csv
import numpy as np
import sys, getopt
import os
from subprocess import call
from subprocess import check_output
def main():
    sdate = ''
    spath = '{0}/ipython/user/{1}/'
    scores_f = os.environ['DSOURCES']+"_scores.csv"
    db = os.environ['DBNAME']
    table = os.environ['DSOURCES']
    impala_node = os.environ['IMPALA_DEM']
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

    impala_cmd = "impala-shell -i {0} -q 'INVALIDATE METADATA {1}.flow'".format(impala_node,db)
    subprocess.call(impala_cmd,shell=True)
    
    impala_cmd = "impala-shell -i {0} -q 'REFRESH {1}.flow'".format(impala_node,db)
    subprocess.call(impala_cmd,shell=True)

    print "Creating Edge Files..."
    conns_list = []
    with open(scores_full_path, 'rb') as f:
        reader = csv.reader(f,delimiter=',')
        reader.next();
        rowct = 1
        for row in reader:
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
                conn = (sip,dip,dy,hr,mm)
                if conn not in conns_list:
                    conns_list.append(conn)
                if rowct == topct:
                    break
                rowct = rowct + 1
    for conn in conns_list:
        sip = conn[0]
        dip = conn[1]
        dy = conn[2]
        hr = conn[3]
        mm = conn[4]

        impala_query = ("SELECT treceived as tstart,sip as srcip,dip as dstip,sport as sport,dport as dport,proto as proto,flag as flags,stos as TOS,ibyt as bytes,ipkt as pkts,input as input, output as output,rip as rip  from {0}.{1} where ((sip=\"{2}\" AND dip=\"{3}\") or (sip=\"{3}\" AND dip=\"{2}\")) AND m={4} AND d={5} AND h={6} AND trminute={7} order by tstart limit 100").format(db,table,sip,dip,mh,dy,hr,mm)

        edge_file = "{0}edge-{1}-{2}-{3}-{4}.tsv".format(spath,sip.replace(".","_"),dip.replace(".","_"),hr,mm)
        impala_cmd = "impala-shell -i {0} --print_header -B --output_delimiter='\\t' -q '{1}' -o {2}".format(impala_node,impala_query,edge_file)

        print 'processing line ',rowct
        print impala_cmd
        check_output(impala_cmd, shell=True)

    print "Done Creating Edge Files..."

    print "\n Creating Chord Files..."
    srcdict = {}
    rowct = 1
    with open(scores_full_path, 'rb') as f:
        reader = csv.reader(f,delimiter=',')
        reader.next();
        rowct = 1
        for row in reader:
            if row[2] in srcdict:
                srcdict[row[2]] += 1
            else:
                srcdict[row[2]] = 1
            if row[3] in srcdict:
                srcdict[row[3]] += 1
            else:
                srcdict[row[3]] = 1
            rowct += 1
            if rowct == topct:
                break

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
                chord_file = "{0}chord-{1}.tsv".format(spath,ip.replace(".","_"))
                dstip_list = dstip[:-1]
                
                impala_query = ("SELECT sip as srcip, dip as dstip, MAX(ibyt) as maxbyte, AVG(ibyt) as avgbyte, MAX(ipkt) as maxpkt, AVG(ipkt) as avgpkt from {0}.{1} where m={2} and d={3} and ( (sip=\"{4}\" and dip IN(\"{5}\")) or (sip IN(\"{5}\") and dip=\"{4}\") ) group by sip,dip").format(db,table,mh,dy,ip,dstip_list)

                impala_cmd = "impala-shell -i {0} --print_header -B --output_delimiter='\\t' -q '{1}' -o {2}".format(impala_node,impala_query,chord_file)
                print 'processing line ',ipct
                print impala_cmd

                check_output(impala_cmd,shell=True)

        if ipct == topct:
            break
        ipct += 1

main()
