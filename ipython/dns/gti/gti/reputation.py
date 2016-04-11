import json
from subprocess import check_output

class Reputation(object):
    
    def __init__(self,conf):
	self.initialize_members(conf)

    def initialize_members(self,conf):
	self._gti_server = conf['server']
	self._gti_user = conf['user']
	self._gti_password = conf['password']
	self._gti_ci = conf['ci']
	self._gti_rest_client_path = conf['refclient']

    def check(self,ips=None, urls=None):
	print "GTI reputation check starts..."
	reputation_dict = {}
	command = "{0} -s {1} -q \'{2}\' -i {3} -p \'{4}\' -t".format(self._gti_rest_client_path, self._gti_server, self._gti_ci, self._gti_user, self._gti_password)
	if ips is not None:
	    values = ips
	    command = command.replace('###OPTION###','ip')
	elif urls is not None:
	    values = urls
	    command = command.replace('###OPTION###','url')
	else:
	    print "Need either an ip or an url to check reputation."
	    return reputation_dict
	
	for val in values:
	    cmd_temp = command
	    command = command.replace('###IP#URL###',val)
	    try:
		response_json = check_output(command, shell=True)
		result_dict = json.loads(response_json[0:len(response_json) - 1])
		reputation = result_dict['a'][0]['rep']
		reputation = int(reputation)
		reputation_dict[val] = self._get_reputation_label(reputation)			
	    except:
		reputation_dict[val] = self._get_reputation_label(16)
	    
	    command = cmd_temp
	return reputation_dict

    def _get_reputation_label(self,reputation):
	if reputation < 15:
	    return "gti:Minimal:1"
	elif reputation >= 15 and reputation < 30:
	    return "gti:Unverified:-1"
	elif reputation >= 30 and reputation < 50:
	    return "gti:Medium:2"
	elif reputation >= 50:
	    return "gti:High:3"	    
	
