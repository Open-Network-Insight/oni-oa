import json
from subprocess import check_output, CalledProcessError


def _get_reputation_label(reputation):
    if reputation < 15:
        return "gti:Minimal:1"
    elif 15 <= reputation < 30:
        return "gti:Unverified:-1"
    elif 30 <= reputation < 50:
        return "gti:Medium:2"
    elif reputation >= 50:
        return "gti:High:3"


class Reputation(object):
    BATCH_SIZE = 5
    REP_KEY = 'rep'
    AFLAG_KEY = 'aflag'
    DEFAULT_REP = 16
    QUERY_PLACEHOLDER = "###QUERY###"

    def __init__(self, conf):
        self._gti_rest_client_path = conf['refclient']
        self._gti_ci = conf['ci']
        self._gti_password = conf['password']
        self._gti_user = conf['user']
        self._gti_server = conf['server']

    def check(self, ips=None, urls=None):
        print "GTI reputation check starts..."
        reputation_dict = {}
        command = "{0} -s {1} -q \'{2}\' -i {3} -p \'{4}\' -t".format(self._gti_rest_client_path, self._gti_server,
                                                                      self._gti_ci, self._gti_user, self._gti_password)
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
            queries.append("{\"op\":\"" + op + "\", \"" + op + "\":\"" + val + "\"}")
            i += 1
            if i == self.BATCH_SIZE:
                cmd_temp = command
                query = ",".join(queries)
                command = command.replace(self.QUERY_PLACEHOLDER, query)
                responses += self._call_gti(command, self.BATCH_SIZE)
                command = cmd_temp
                i = 0
                queries = []

        if len(queries) > 0:
            query = ",".join(queries)
            command = command.replace(self.QUERY_PLACEHOLDER, query)
            responses += self._call_gti(command, len(queries))

        ip_counter = 0
        for query_resp in responses:
            if self.AFLAG_KEY in query_resp or self.REP_KEY not in query_resp:
                reputation_dict[values[ip_counter]] = _get_reputation_label(self.DEFAULT_REP)
            else:
                reputation = query_resp[self.REP_KEY]
                reputation = int(reputation)
                reputation_dict[values[ip_counter]] = _get_reputation_label(reputation)
            ip_counter += 1
        return reputation_dict

    def _call_gti(self, command, num_values):
        try:
            response_json = check_output(command, shell=True)
            result_dict = json.loads(response_json[0:len(response_json) - 1])
            responses = result_dict['a']
            return responses
        except CalledProcessError as e:
            print "Error calling McAfee GTI client in gti module: " + e.output
            error_resp = [{self.REP_KEY: self.DEFAULT_REP}] * num_values
            return error_resp
        except ValueError as e:
            print "Error reading JSON response in gti module: " + e.message
            error_resp = [{self.REP_KEY: self.DEFAULT_REP}] * num_values
            return error_resp
