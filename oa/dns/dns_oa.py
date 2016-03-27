import os
import json
import sys, getopt
import csv
from subprocess import check_output
from impala.dbapi import connect
from inscreenlog import *

script_path = os.path.dirname(os.path.abspath(__file__))
gti_config_file = "{0}/gti/gti_config.json".format(script_path)
db_config_file = "../../api/config/config.json"
csv_file = "data.csv"
rep_services = []

def main():
    query_ip_dict = {}
    limit = 0
    usage = 'usage: python dns-oa.py -d <date yyyymmdd> -o <hour hh> -ipython <dns ipython location> -limit <limit number>'

    info("DNS OA starts...")
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'hd:o:i:l:',["help","date=", "hour=" ,"ipython=","limit="])
    except getopt.GetoptError as err:
        print usage
        sys.exit(2)
    for opt,arg in opts:
        if opt in ("-h", "-help"):
            print usage
            sys.exit()
        elif opt in ("-d", "-date"):
            date = arg
            if len(date) != 8:
                error("Wrong date format, please verify. Excepected format is YYYYMMDD")
                sys.exit()
        elif opt in ("-o", "-hour"):
            h = arg
            if len(h) != 2:
                error("Wrong hour format, please verify Expected format is HH.")
		sys.exit()
	    elif int(h) > 0 and int(h)< 23:
		error("Invalid hour, please provide a valid hour with format HH.")
		sys.exit()
        elif opt in ("-i","-ipython"):
           dns_ipython_location = arg
	elif opt in ("-l", "-limit"):
	    limit = arg

    if limit == 0:
	error("You need to pass a value for limit")
	print usage
	sys.exit()
    
    y = date[:4]
    m = date[4:6]
    d = date[6:]

    if not os.path.isfile(db_config_file):
        error("config.json file not found at api/config/config.json, please make sure the file exists and try again")
        sys.exit()
    else: 
	db_config = json.load(open(db_config_file))
	impala_host = db_config['API']['Impala']['DB_HOST']
        impala_port = db_config['API']['Impala']['PORT']
        db = db_config['API']['DATABASE']
 
	with connect(host=impala_host, port=int(impala_port)) as conn:
 
	    cur = list(get_dns_data(y,m,d,h,limit,db,conn))
	    if len(cur) == 0:
		info("There is no data in dns_ml for the date and hour provided, please try a different one.")
		info("DNS OA completed but no data was found.")
		sys.exit(1)
 
	    if os.path.isfile(gti_config_file):
		gti_config = json.load(open(gti_config_file))
		init_rep_services(gti_config)
		
		indexes = gti_config["target_columns"]
		cols = []
		rep_services_results = []
		for index in indexes:
		    cols += extract_column(cur,index)
		query_ip_dict = dict([(x,{}) for x in set(cols)])
		info("Getting reputation for each service in config")
		rep_services_results = [rep_service.check(None, query_ip_dict.keys()) for rep_service in rep_services]
		all_rep_results = merge_rep_results(rep_services_results)
		for val in query_ip_dict:
		    try:
			query_ip_dict[val]['rep'] = all_rep_results[val]
		    except:
			query_ip_dict[val]['rep'] = "UNKNOWN" 	      
	    else:
		info("gti_config.json not present, will send data without reputation information")

	    info("Adding reputation column to dns_ml data")
	    updated_data = [append_rep_column(query_ip_dict,row) for row in cur]
	
	info("Adding HH (hour) column to new data")
	updated_data = [append_hh_column(h,row) for row in updated_data]
	info("Saving data to local csv")
	save_to_csv_file(updated_data)
	info("Saving data to dns_susp_tmp table")
	load_dns_scores_tmp()
	info("Saving to dns_susp table")
    	load_dns_scores(y,m,d)
	info("Deleting local and stage files")
	delete_local_stage_file()
	info("Creating ipython notebooks")
	create_ipython_notebooks(date,dns_ipython_location)
	info("DNS OA successfully completed")

def get_dns_data(y,m,d,h,limit,db,conn):
    cur = []
    querystr = ("SELECT dns_ml.frame_time, "
    "dns_ml.frame_len, "
    "dns_ml.ip_dst, "
    "dns_ml.dns_qry_name, "
    "dns_ml.dns_qry_class, "
    "dns_ml.dns_qry_type, "
    "dns_ml.dns_qry_rcode, "
    "dns_ml.domain, "
    "dns_ml.subdomain, "
    "dns_ml.subdomain_length, "
    "dns_ml.query_length, "
    "dns_ml.num_periods, "
    "dns_ml.subdomain_entropy, "
    "dns_ml.top_domain, "
    "dns_ml.word, "
    "dns_ml.score "
    "FROM dns_ml "
    "WHERE dns_ml.y = {0} AND dns_ml.m = {1} AND dns_ml.d = {2} AND dns_ml.h = {3} "
    "LIMIT {4}").format(y,m,d,h,limit)
    info("Executing impala query: " + querystr)
    cur = conn.cursor()
    cur.execute('USE {0}'.format(db))
    cur.execute(querystr)
    return cur

def load_dns_scores(y,m,d):
    hive_command = ("\" USE duxbury; "
    "INSERT INTO TABLE dns_susp "
    "PARTITION(y={0},m={1},d={2}) "
    "SELECT d.frame_time, "
    "d.frame_len, "
    "d.ip_dst, "
    "d.dns_qry_name, "
    "d.dns_qry_class, "
    "d.dns_qry_type, "
    "d.dns_qry_rcode, "
    "d.domain, "
    "d.subdomain, "
    "d.subdomain_length, "
    "d.query_length, "
    "d.num_periods, "
    "d.subdomain_entropy, "
    "d.top_domain, "
    "d.word, "
    "d.score, "
    "d.query_rep, "
    "d.hh "
    "FROM dns_susp_tmp d;\"").format(y,m,d)
    info("Executing hive command: " + hive_command)
    hive_response = check_output("hive -e {0}".format(hive_command), shell=True)
    print hive_response

def load_dns_scores_tmp():
    hive_command = "\"USE duxbury; LOAD DATA LOCAL INPATH \'{0}/{1}\' INTO TABLE dns_susp_tmp;\"".format(script_path,csv_file)
    info("Executing hive command: " + hive_command)
    hive_response = check_output("hive -e {0}".format(hive_command), shell=True)
    print hive_response 
     
def save_to_csv_file(data):
    csv_file_location = "{0}/{1}".format(script_path,csv_file)
    with open(csv_file_location, 'w+') as dns_file:
	writer = csv.writer(dns_file)
	writer.writerows(data)

def delete_local_stage_file():
    hadoop_command = "hadoop fs -rm /user/duxbury/dns/suspicious/stage/*"
    info("Executing hadoop command: " + hadoop_command)
    check_output(hadoop_command, shell=True)
    command = "rm {0}/{1}".format(script_path,csv_file)
    check_output(command, shell=True)
    
def extract_column(cur,index):
    return list(map(None,*cur)[index])

def init_rep_services(gti_config):
    for service in gti_config:
	if service != "target_columns":
	    config = gti_config[service]	    
	    module = __import__("gti.{0}.reputation".format(service),fromlist=['Reputation'])
	    rep_services.append(module.Reputation(config))

def append_rep_column(query_ip_dict,row):
    column = ""
    if row[3] in query_ip_dict:
        column = query_ip_dict[row[3]]['rep']
    return row + (column,)

def append_hh_column(h, row):
   column = int(h)
   return row + (column,)

def merge_rep_results(ds):
    z = {}
    for d in ds:
	z = {k : "{0}::{1}".format(z.get(k,""),d.get(k,"")).strip('::') for k in set(z) | set(d) }
    return z

def create_ipython_notebooks(date,dns_ipython_location):
    ipython_notebooks_script = "{0}/set_ipython_notebooks.sh".format(script_path)
    command = "{0} {1} {2}".format(ipython_notebooks_script,dns_ipython_location,date)
    check_output(command, shell=True)    
	    
main()

