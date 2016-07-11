
import logging
import os
import json
import shutil
from collections import OrderedDict
from utils import Util
from components.data.data import Data

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
            self._dns_results = Util.read_results(dns_results,self._limit)          
            if len(self._dns_results) == 0: self._logger.error("There are not flow results.");sys.exit(1)

        else:
            self._logger.error("There was an error getting ML results from HDFS")
            sys.exit(1)

        # add headers.
        self._logger.info("Adding headers based on configuration file: score_fields.json")
        self._dns_scores = [ [ str(key) for (key,value) in self._conf['dns_score_fields'].items()] ]

        # add dns content.
        self._dns_scores.extend([ [0] +  [ conn[i] for i in self._conf['column_indexes_filter'] ] + [(conn[ldaab_index] if (conn[ldaab_index]<= conn[ldaba_index]) else conn[ldaba_index])] + [n]  for n, conn in enumerate(self._flow_results) ])

        # create bk file
        dns_scores_csv = "{0}/dns_scores_bu.csv".format(self._data_path)
        Util.create_csv_file(dns_scores_csv,self._dns_scores)      