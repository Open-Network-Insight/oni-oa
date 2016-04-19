import csv
import os

NCDNS = "network_context_dns"

class NetworkContext(object):
    def __init__(self, config):
	if NCDNS in config:
	    self._nc_dns_file_path = config[NCDNS]
	
	self.nc_dns_dict = {}
	self.init_dicts()
    
    def init_dicts(self):
	if os.path.isfile(self._nc_dns_file_path):
	    with open(self._nc_dns_file_path) as nc_dns_file:
		csv_reader = csv.reader(nc_dns_file)
		csv_reader.next()
		nc_dns_rows = list(csv_reader)
		self.nc_dns_dict = dict([(x[0],x[1]) for x in nc_dns_rows])
    
    def get_nc(self, key):
	if key in self.nc_dns_dict:
	    return self.nc_dns_dict[key]
	else:
	    return ""
