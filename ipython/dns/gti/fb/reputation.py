import json
import urllib2
import urllib


def _get_reputation_label(reputation):
    if reputation == 'UNKNOWN':
        return "fb:UNKNOWN:-1"
    elif reputation == 'NON_MALICIOUS':
        return "fb:NON_MALICIOUS:0"
    elif reputation == 'SUSPICIOUS':
        return "fb:SUSPICIOUS:2"
    elif reputation == 'MALICIOUS':
        return "fb:MALICIOUS:3"


class Reputation(object):
    def __init__(self, conf):
        self._fb_app_id = conf['app_id']
        self._fb_app_secret = conf['app_secret']

    def check(self, ips=None, urls=None):
        print "Threat-Exchange reputation check starts..."
        reputation_dict = {}
        data = []

        if ips is not None:
            values = ips
            qtype = 'IP_ADDRESS'
            getopt = 'GET_IP_'
        elif urls is not None:
            values = urls
            qtype = 'DOMAIN'
            getopt = 'GET_NAME_'
        else:
            print "Need either an ip or an url to check reputation."
            return reputation_dict

        for val in values:
            query_params = urllib.urlencode({
                'type': qtype,
                'text': val
            })

            indicator_request = {
                'method': 'GET',
                'name': "{0}{1}".format(getopt, val.replace('.', '_')),
                'relative_url': "/v2.4/threat_indicators?{0}".format(query_params)
            }

            descriptor_request = {
                'method': 'GET',
                'relative_url': '/v2.4/{result=' + getopt + val.replace('.', '_') + ':$.data.*.id}/descriptors'
            }

            data.append(indicator_request)
            data.append(descriptor_request)

            reputation_dict.update(self._request_reputation(data, val))
            data = []

        if len(data) > 0:
            reputation_dict.update(self._request_reputation(data))

        return reputation_dict

    def _request_reputation(self, data, name):
        reputation_dict = {}
        token = "{0}|{1}".format(self._fb_app_id, self._fb_app_secret)
        request_body = {
            'access_token': token,
            'batch': data
        }
        request_body = urllib.urlencode(request_body)

        url = "https://graph.facebook.com/"
        content_type = {'Content-Type': 'application/json'}
        request = urllib2.Request(url, request_body, content_type)
        try:
            str_response = urllib2.urlopen(request).read()
            response = json.loads(str_response)
        except urllib2.HTTPError as e:
            print "Error calling ThreatExchange in module fb: " + e.message
            reputation_dict[name] = _get_reputation_label('UNKNOWN')
            return reputation_dict

        for row in response:
            if row is None:
                continue

            if row['code'] != 200:
                reputation_dict[name] = _get_reputation_label('UNKNOWN')
                return reputation_dict

            if 'body' in row:
                row_response = json.loads(row['body'])
                if 'data' in row_response:
                    row_response_data = row_response['data']
                    name = row_response_data[0]['indicator']['indicator']
                    reputation_dict[name] = _get_reputation_label(row_response_data[0]['status'])
                else:
                    reputation_dict[name] = _get_reputation_label('UNKNOWN')
            else:
                reputation_dict[name] = _get_reputation_label('UNKNOWN')

        return reputation_dict