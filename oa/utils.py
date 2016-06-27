import logging

class Util(object):

    @classmethod
    def create_logger(cls,looger_name,create_file=False):

        # create logger for prd_ci
		log = logging.getLogger(looger_name)
		log.setLevel(level=logging.DEBUG)

		# create formatter and add it to the handlers
		formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

		if create_file:
			# create file handler for logger.
			fh = logging.FileHandler('oa.log')
			fh.setLevel(level=logging.DEBUG)
			fh.setFormatter(formatter)

		# reate console handler for logger.
		ch = logging.StreamHandler()
		ch.setLevel(level=logging.DEBUG)
		ch.setFormatter(formatter)

		# add handlers to logger.
		if create_file: log.addHandler(fh)
		log.addHandler(ch)	

		return  log
