#!/bin/env python

import argparse
import os
import sys
import logging

from utils import Util

# get script path.
script_path = os.path.dirname(os.path.abspath(__file__))

def main():

    # input parameters.
    parser = argparse.ArgumentParser(description="Master OA Script")
    parser.add_argument('-d','--date',required=True,dest='date',help='Date data that will be processed by OA  (i.e 20161102)',metavar='')
    parser.add_argument('-t','--type',required=True,dest='type',help='Data type that will be processed by OA (i.e dns, proxy, flow)',metavar='')
    parser.add_argument('-l','--limit',required=True,dest='limit',help='Num of suspicious connections that will be processed by OA.',metavar='')
    args= parser.parse_args()

    start_oa(args)

def start_oa(args):

    # setup the main logger for all the OA process.    
    logger = Util.create_logger('OA',create_file=False)

    logger.info("Validating parameter values...")
    validate_parameters_values(args,logger)

    logger.info("Creating folder structure for OA data...")
    create_folder_structure(args.type,args.date) 

    # create data type instance.
    module = __import__("{0}.{0}_oa".format(args.type),fromlist=['OA'])
   
    # start OA.
    oa_process = module.OA()
    oa_process.start()

def create_folder_structure(type,date):

    # create date folder if it does not exist.
    data_type_folder = "../data/{0}/{1}"    
    if not os.path.isdir(data_type_folder.format(type,date)): os.makedirs(data_type_folder.format(type,date))
    if not os.path.isdir(data_type_folder.format(type,"ingest_summary")): os.makedirs(data_type_folder.format(type,"ingest_summary"))

   
def validate_parameters_values(args,logger):
    
    #date.
    is_date_ok = True if len(args.date) == 8 else False    

    # type
    dirs = os.walk(script_path).next()[1]
    is_type_ok = True if args.type in dirs else False
   
    #limit    
    try:
        int(args.limit)
        is_limit_ok = True
    except ValueError:
        is_limit_ok = False
      
    if not is_date_ok: logger.error("date parameter is not correct, please validate it") 
    if not is_type_ok: logger.error("type parameter is not supported, please select a valid type")
    if not is_limit_ok: logger.error("limit parameter is not correct, please select a valid limit")

    if not is_date_ok or not is_type_ok or not is_limit_ok: sys.exit(1)
    


		# create logger for prd_ci
		log = logging.getLogger('OA')
		log.setLevel(level=logging.DEBUG)

		# create formatter and add it to the handlers
		formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

		# create file handler for logger.
		#fh = logging.FileHandler('oa.log')
		#fh.setLevel(level=logging.DEBUG)
		#fh.setFormatter(formatter)

		# reate console handler for logger.
		ch = logging.StreamHandler()
		ch.setLevel(level=logging.DEBUG)
		ch.setFormatter(formatter)

		# add handlers to logger.
		#log.addHandler(fh)
		log.addHandler(ch)	

		return  log

if __name__=='__main__':
    main()