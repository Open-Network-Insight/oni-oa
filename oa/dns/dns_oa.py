
import logging
import os
import json
import shutil
from collections import OrderedDict
from utils import Util
from components.data.data import Data
from components.iana.iana_transform import IanaTransform
from components.nc.network_context import NetworkContext 

import time

class OA(object):
    
    def __init__(self,date,limit=500,logger=None):

        self._initialize_members(date,limit,logger)

    def _initialize_members(self,date,limit,logger):
        
        # get logger if exists. if not, create new instance.
        self._logger = logging.getLogger('OA.DNS') if logger else Util.get_logger('OA.DNS',create_file=False)

        # initialize required parameters.
        self._scrtip_path = os.path.dirname(os.path.abspath(__file__))
        self._date = date
        self._dns_results = []
        self._limit = limit
        self._data_path = None
        self._ipynb_path = None
        self._ingest_summary_path = None
        self._dns_scores = []
        self._dns_scores_headers = []

        # get app configuration.
        self._oni_conf = Util.get_oni_conf()

        # get scores fields conf
        conf_file = "{0}/dns_conf.json".format(self._scrtip_path)
        self._conf = json.loads(open (conf_file).read(),object_pairs_hook=OrderedDict)

        # initialize data engine
        self._db = self._oni_conf.get('conf','DBNAME').replace("'","").replace('"','') 
        #self._engine = Data(self._db,self._logger)


    def start(self):

        ####################
        start = time.time()
        ####################

        self._create_folder_structure()
        self._add_ipynb()
        self._get_dns_results()
        self._add_reputation()
        self._add_hh_and_severity()
        self._add_iana()
        self._add_network_context()
        self._create_dns_scores_csv()

        ##################
        end = time.time()
        print(end - start)
        ##################

    def _create_folder_structure(self):

        # create date folder structure if it does not exist.
        self._logger.info("Creating folder structure for OA (data and ipynb)")       
        self._data_path,self._ingest_summary_path,self._ipynb_path = Util.create_oa_folders("dns",self._date)
    
    def _add_ipynb(self):

        if os.path.isdir(self._ipynb_path):

            self._logger.info("Adding edge investigation IPython Notebook")
            shutil.copy("{0}/ipynb_templates/Edge_Investigation_master.ipynb".format(self._scrtip_path),"{0}/Edge_Investigation.ipynb".format(self._ipynb_path))

            self._logger.info("Adding threat investigation IPython Notebook")
            shutil.copy("{0}/ipynb_templates/Threat_Investigation_master.ipynb".format(self._scrtip_path),"{0}/Threat_Investigation.ipynb".format(self._ipynb_path))

        else:
            self._logger.error("There was a problem adding the IPython Notebooks, please check the directory exists.")


    def _get_dns_results(self):

        self._logger.info("Getting {0} Machine Learning Results from HDFS".format(self._date))
        dns_results = "{0}/dns_results.csv".format(self._data_path)

        # get hdfs path from conf file.
        HUSER = self._oni_conf.get('conf','HUSER').replace("'","").replace('"','')   
        hdfs_path = "{0}/dns/scored_results/{1}/scores/dns_results.csv".format(HUSER,self._date)

        # get results file from hdfs.
        get_command = Util.get_ml_results_form_hdfs(hdfs_path,self._data_path)
        self._logger.info("{0}".format(get_command))

         # valdiate files exists
        if os.path.isfile(dns_results):

            # read number of results based in the limit specified.
            self._logger.info("Reading {0} dns results file: {1}".format(self._date,dns_results))
            self._dns_results = Util.read_results(dns_results,self._limit)[:]        
            if len(self._dns_results) == 0: self._logger.error("There are not flow results.");sys.exit(1)

        else:
            self._logger.error("There was an error getting ML results from HDFS")
            sys.exit(1)

        # add headers.        
        self._logger.info("Adding headers")
        self._dns_scores_headers = [  str(key) for (key,value) in self._conf['dns_score_fields'].items() ]

        # add dns content.
        self._dns_scores = [ conn[:]  for conn in self._dns_results][:]
        dns_scores_bu = [ conn[:]  for conn in self._dns_results][:]

        # create bk file
        dns_scores_csv = "{0}/dns_scores_bu.csv".format(self._data_path) 
                
        # move unixtime stamp to the end.        
        dns_scores_bu = self._move_time_stamp(dns_scores_bu)
        dns_scores_bu.insert(0,self._dns_scores_headers) 
        Util.create_csv_file(dns_scores_csv,dns_scores_bu)  

    def _move_time_stamp(self,dns_data):
        
        for dns in dns_data:
            time_stamp = dns[1]
            dns.remove(time_stamp)
            dns.append(time_stamp)
        
        return dns_data        

    def _create_dns_scores_csv(self):
        
        dns_scores_csv = "{0}/dns_scores.csv".format(self._data_path)
        dns_scores_final =  self._move_time_stamp(self._dns_scores)
        dns_scores_final.insert(0,self._dns_scores_headers)
        Util.create_csv_file(dns_scores_csv,dns_scores_final)    
  
    def _add_reputation(self):

        # read configuration.
        reputation_conf_file = "{0}/components/reputation/reputation_config.json".format(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self._logger.info("Reading reputation configuration file: {0}".format(reputation_conf_file))
        rep_conf = json.loads(open(reputation_conf_file).read())
       
        # initialize reputation services.
        self._rep_services = []
        self._logger.info("Initializing reputation services.")
        for service in rep_conf:               
             config = rep_conf[service]
             module = __import__("components.reputation.{0}.{0}".format(service), fromlist=['Reputation'])
             self._rep_services.append(module.Reputation(config,self._logger))
                
        # get columns for reputation.
        rep_cols = {}
        indexes =  [ int(value) for key, value in self._conf["add_reputation"].items()]  
        self._logger.info("Getting columns to add reputation based on config file: dns_conf.json".format())
        for index in indexes:
            col_list = []
            for conn in self._dns_scores:
                col_list.append(conn[index])            
            rep_cols[index] = list(set(col_list))

        # get reputation per column.
        self._logger.info("Getting reputation for each service in config")        
        rep_services_results = []
        for key,value in rep_cols.items():
            rep_services_results = [ rep_service.check(None,value) for rep_service in self._rep_services]
            rep_results = {}            
            for result in rep_services_results:            
                rep_results = {k: "{0}::{1}".format(rep_results.get(k, ""), result.get(k, "")).strip('::') for k in set(rep_results) | set(result)}

            self._dns_scores = [ conn + [ rep_results[conn[key]] ]   for conn in self._dns_scores  ]

        

    def _add_hh_and_severity(self):

        # add hh value and sev columns.
        dns_date_index = self._conf["dns_results_fields"]["frame_time"]        
        self._dns_scores = [conn + [ conn[dns_date_index].split(" ")[3].split(":")[0]] + [0] + [0] for conn in self._dns_scores  ]

    def _add_iana(self):

        iana_conf_file = "{0}/components/iana/iana_config.json".format(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if os.path.isfile(iana_conf_file):
            iana_config  = json.loads(open(iana_conf_file).read())
            dns_iana = IanaTransform(iana_config["IANA"])

            dns_qry_class_index = self._conf["dns_results_fields"]["dns_qry_class"]
            dns_qry_type_index = self._conf["dns_results_fields"]["dns_qry_type"]
            dns_qry_rcode_index = self._conf["dns_results_fields"]["dns_qry_rcode"]
            self._dns_scores = [ conn + [ dns_iana.get_name(conn[dns_qry_class_index],"dns_qry_class")] + [dns_iana.get_name(conn[dns_qry_type_index],"dns_qry_type")] + [ dns_iana.get_name(conn[dns_qry_rcode_index],"dns_qry_rcode") ] for conn in self._dns_scores ]
            
        else:            
            self._dns_scores = [ conn + ["","",""] for conn in self._dns_scores ] 

    def _add_network_context(self):

        nc_conf_file = "{0}/components/nc/nc_config.json".format(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if os.path.isfile(nc_conf_file):
            nc_conf = json.loads(open(nc_conf_file).read())["NC"]
            dns_nc = NetworkContext(nc_conf,self._logger)
            ip_dst_index = self._conf["dns_results_fields"]["ip_dst"]
            self._dns_scores = [ conn + [dns_nc.get_nc(conn[ip_dst_index])] for conn in self._dns_scores ]

        else:
            self._dns_scores = [ conn + [""] for conn in self._dns_scores ]
