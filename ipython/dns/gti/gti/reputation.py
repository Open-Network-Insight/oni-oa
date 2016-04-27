import json
from subprocess import check_output

class Reputation(object):
    
    BATCH_SIZE = 10
    REP_KEY = 'rep'
    AFLAG_KEY = 'aflag'
    DEFAULT_REP = 16
    QUERY_PLACEHOLDER = "###QUERY###"
    
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
	op = ""
	command = "{0} -s {1} -q \'{2}\' -i {3} -p \'{4}\' -t".format(self._gti_rest_client_path, self._gti_server, self._gti_ci, self._gti_user, self._gti_password)
	if ips is not None:
	    values = ips
	    op = "ip"
	elif urls is not None:
	    values = urls
	    op = "url"
	else:
	    print "Need either an ip or an url to check reputation."
	    return reputation_dict
	
	i = 0
        queries = []
        responses = []
	for val in values:
	    queries.append("{\"op\":\"" + op + "\", \""+ op +"\":\""+ val +"\"}")
            i += 1
            if i == self.BATCH_SIZE:
                cmd_temp = command
                query = ",".join(queries)
                command = command.replace(self.QUERY_PLACEHOLDER, query)
                responses += self._call_gti(command)
                command = cmd_temp
                i = 0
                query = ""
                queries = []

        if len(queries) > 0:
            query = ",".join(queries)
            command = command.replace(self.QUERY_PLACEHOLDER, query)
            responses += self._call_gti(command)
            command = cmd_temp

        ip_counter = 0
        for query_resp in responses:
            if self.AFLAG_KEY in query_resp or self.REP_KEY not in query_resp:
                reputation_dict[values[ip_counter]] = self._get_reputation_label(self.DEFAULT_REP)
            else:
		reputation = query_resp[self.REP_KEY]
                reputation = int(reputation)
                reputation_dict[values[ip_counter]] = self._get_reputation_label(reputation)
            ip_counter += 1
        return reputation_dict

    def _call_gti(self, command):
        try:
            response_json = check_output(command, shell=True)
            result_dict = json.loads(response_json[0:len(response_json) - 1])
            responses = result_dict['a']
            return responses
        except:
            error_resp = [{self.REP_KEY: self.DEFAULT_REP}] * 10
            return  error_resp

    def _get_reputation_label(self,reputation):
	if reputation < 15:
	    return "gti:Minimal:1"
	elif reputation >= 15 and reputation < 30:
	    return "gti:Unverified:-1"
	elif reputation >= 30 and reputation < 50:
	    return "gti:Medium:2"
	elif reputation >= 50:
	    return "gti:High:3"	    
	
