
import logging
import shutil
import os
from utils import Util 

class OA(object):

    def __init__(self,date,limit=500,logger=None):       
       
       self._initialize_members(date,limit,logger)
       
    def _initialize_members(self,date,limit,logger):
        
        # get logger if exists. if not, create new instance.
        self._logger = logging.getLogger('OA.Flow') if logger else Util.create_logger('OA.FlowEver',create_file=False)

        # initialize required parameters.
        self._date = date
        self._flow_results = None
        self._limit = limit
              
    def start(self):       
               
        self._create_ipynb()
        self._get_flow_results()
    
    def _create_ipynb(self):

        # getting path.
        script_path = os.path.dirname(os.path.abspath(__file__))
        dst_dir = "../ipynb/flow/{0}".format(self._date)

        self._logger.info("Creating flow ipynb folder structure: {0}".format(dst_dir))
        if not os.path.isdir(dst_dir): os.makedirs(dst_dir)

        self._logger.info("Adding edge investigation ipython notebook")
        shutil.copy("{0}/ipynb_templates/Edge_Investigation_master.ipynb".format(script_path),"{0}/Edge_Investigation.ipynb".format(dst_dir))

        self._logger.info("Adding threat investigation IPython Notebook")
        shutil.copy("{0}/ipynb_templates/Threat_Investigation_master.ipynb".format(script_path),"{0}/Threat_Investigation.ipynb".format(dst_dir))
    
    def _get_flow_results(self):

        self._logger.info("Getting {0} Machine Learning Results".format(self._date))

    #def _suspicios_connects(self):

    #def _suspicious_details(self):

    #def _chord_diagrams(self):