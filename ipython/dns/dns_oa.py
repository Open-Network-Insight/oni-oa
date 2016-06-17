import os
import json
import sys, getopt
import csv
import subprocess
from inscreenlog import *
from iana import iana_transform
from nc import network_context
import shutil

script_path = os.path.dirname(os.path.abspath(__file__))
gti_config_file = "{0}/gti/gti_config.json".format(script_path)
iana_config_file = "{0}/iana/iana_config.json".format(script_path)
nc_config_file = "{0}/nc/nc_config.json".format(script_path)
rep_services = []


def main():
    query_ip_dict = {}
    limit = 0
    usage = 'usage: python dns_oa.py -d <date yyyymmdd> -ipython <dns ipython location> -limit <limit number>'

    info("DNS OA starts...")
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'hd:i:l:', ["help", "date=", "ipython=", "limit="])
    except getopt.GetoptError as err:
        print usage
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-h", "-help"):
            print usage
            sys.exit()
        elif opt in ("-d", "-date"):
            date = arg
            if len(date) != 8:
                error("Wrong date format, please verify. Excepected format is YYYYMMDD")
                sys.exit()
        elif opt in ("-i", "-ipython"):
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

    dns_results_file_path = "../user/{0}/dns_results.csv".format(date)
    updated_data = []
    info("Creating ipython notebooks and execution date folder")
    create_ipython_notebooks(date, dns_ipython_location)

    if not os.path.isfile(dns_results_file_path):
        error(
            "dns_results.csv file not found at ipython/user/{0}, please make sure the file exists and try again".format(
                date))
        sys.exit()
    else:
        with open(dns_results_file_path, 'rb') as dns_results_file:

            cur = [row.rstrip("\r\n").split(",") for row in dns_results_file]
            if len(cur) == 0 or len(cur) == 1:
                info(
                    "There is no data in file dns_results.csv for the date and hour provided, please try a different one.")
                info("DNS OA completed but no data was found.")
                sys.exit(1)

            if (int(limit) + 1) >= len(cur):
                cur = cur[1:]
            else:
                cur = cur[1:int(limit) + 1]

            if os.path.isfile(gti_config_file):
                gti_config = json.load(open(gti_config_file))
                init_rep_services(gti_config)

                indexes = gti_config["target_columns"]
                cols = []
                rep_services_results = []
                for index in indexes:
                    cols += extract_column(cur, index)
                query_ip_dict = dict([(x, {}) for x in set(cols)])
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
            updated_data = [append_rep_column(query_ip_dict, row) for row in cur]
        info("Transforming data removing unix_tstamp column")
        updated_data = [remove_unix_tstamp_column(row) for row in updated_data]
        info("Adding HH (hour) column to new data")
        updated_data = [append_hh_column(row) for row in updated_data]
        info("Adding severety columns")
        updated_data = [append_sev_columns(row) for row in updated_data]
        info("Adding iana labels")
        if os.path.isfile(iana_config_file):
            iana_config = json.load(open(iana_config_file))
            iana = iana_transform.IanaTransform(iana_config["IANA"])
            updated_data = [add_iana_translation(row, iana) for row in updated_data]
        else:
            updated_data = [row[:-1] + ["", "", ""] + [row[-1]] for row in updated_data]
        info("Adding network context")
        if os.path.isfile(nc_config_file):
            nc_config = json.load(open(nc_config_file))
            nc = network_context.NetworkContext(nc_config["NC"])
            updated_data = [row[:-1] + [nc.get_nc(row[2])] + [row[-1]] for row in updated_data]
        else:
            updated_data = [row[:-1] + [""] + [row[-1]] for row in updated_data]
        info("Saving data to local csv")
        save_to_csv_file(updated_data, date)
        info("Creating dns scores backup")
        create_dns_backup(date)
        info("Calculating DNS OA details")
        create_dns_details(date)
        info("DNS OA successfully completed")


def create_dns_backup(date):
    src = "{0}/user/{1}/dns_scores.csv".format(script_path, date)
    dst = "{0}/user/{1}/dns_scores_bu.csv".format(script_path, date)
    shutil.copy(src, dst)


def save_to_csv_file(data, date):
    csv_file_location = "{0}/user/{1}/dns_scores.csv".format(script_path, date)
    header = ["frame_time", "frame_len", "ip_dst", "dns_qry_name", "dns_qry_class", "dns_qry_type", "dns_qry_rcode",
              "domain", "subdomain", "subdomain_length", "num_periods", "subdomain_entropy", "top_domain", "word",
              "score", "query_rep", "hh", "ip_sev", "dns_sev", "dns_qry_class_name", "dns_qry_type_name",
              "dns_qry_rcode_name", "network_context", "unix_tstamp"]
    data.insert(0, header)
    with open(csv_file_location, 'w+') as dns_scores_file:
        writer = csv.writer(dns_scores_file)
        writer.writerows(data)


def move_dns_results(dns_results_file_path, date):
    origin = dns_results_file_path
    destination = "{0}/user/{1}/".format(script_path, date)
    subprocess.check_output("mv {0} {1}".format(origin, destination))
    subprocess.check_output("rm {0}".format(origin))


def extract_column(cur, index):
    return list(map(None, *cur)[index])


def init_rep_services(gti_config):
    for service in gti_config:
        if service != "target_columns":
            config = gti_config[service]
            module = __import__("gti.{0}.reputation".format(service), fromlist=['Reputation'])
            rep_services.append(module.Reputation(config))


def append_rep_column(query_ip_dict, row):
    column = ""
    if row[4] in query_ip_dict:
        column = query_ip_dict[row[4]]['rep']
    row.append(column)
    return row


def append_hh_column(row):
    date_time = row[0].split(" ")
    time = date_time[3].split(":")
    hh = time[0]
    temp_row = row[:-1]
    temp_row.append(hh)
    row = temp_row + [row[-1]]
    return row


def append_sev_columns(row):
    temp_row = row[:-1]
    temp_row.append(0)
    temp_row.append(0)
    row = temp_row + [row[-1]]
    return row


def add_iana_translation(row, iana):
    qry_class = row[4]
    qry_type = row[5]
    qry_rcode = row[6]
    col_rcode = 'dns_qry_rcode'
    col_type = 'dns_qry_type'
    col_class = 'dns_qry_class'
    qry_class_name = iana.get_name(qry_class, col_class)
    qry_type_name = iana.get_name(qry_type, col_type)
    qry_rcode_name = iana.get_name(qry_rcode, col_rcode)
    temp_row = row[:-1]
    row = temp_row + [qry_class_name, qry_type_name, qry_rcode_name] + [row[-1]]
    return row


def remove_unix_tstamp_column(row):
    unixtstamp = row[1]
    row.remove(row[1])
    row = row + [unixtstamp]
    return row


def merge_rep_results(ds):
    z = {}
    for d in ds:
        z = {k: "{0}::{1}".format(z.get(k, ""), d.get(k, "")).strip('::') for k in set(z) | set(d)}
    return z


def create_ipython_notebooks(date, dns_ipython_location):
    ipython_notebooks_script = "{0}/set_ipython_notebooks.sh".format(script_path)
    command = "{0} {1} {2}".format(ipython_notebooks_script, dns_ipython_location, date)
    subprocess.check_output(command, shell=True)


def create_dns_details(date):
    dns_scores = "{0}/user/{1}/dns_scores.csv".format(script_path, date)
    destination = "{0}/user/{1}/".format(script_path, date)
    dns_details_cmd = "python dns_oa_details_dendro.py {0} {1}".format(dns_scores, destination)
    subprocess.call(dns_details_cmd, shell=True)


main()
