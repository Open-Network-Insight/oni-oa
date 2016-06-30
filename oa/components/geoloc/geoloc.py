import csv
import bisect
import linecache
import numpy

'''
    Geo Localization Service.
    Returns the geo localization and domain for a given ip address
    in the format of dictionary with two elements.
    i.e.
        {
            "geo_loc": "Delhi;New Delhi Vodafone Essar Limited GPRS Service"
            "domain":"vodafone.in"
        }
'''

IP_LOCALIZATION_FILE = "geo_localization_file"


def get_low_ips_in_ranges(ip_localization_file):
    return numpy.loadtxt(ip_localization_file, dtype=numpy.uint32, delimiter=',', usecols=[0], converters={0: lambda s: numpy.uint32(s.replace('"', ''))})


def ip_to_int(ip):
    o = map(int, ip.split('.'))
    res = (16777216 * o[0]) + (65536 * o[1]) + (256 * o[2]) + o[3]
    return res


class GeoLocalization(object):
    def __init__(self, config):
        self.ip_localization_file = config[IP_LOCALIZATION_FILE]
        self.low_ips_in_ranges = get_low_ips_in_ranges(self.ip_localization_file)

    def get_ip_geo_localization(self, ip):
        if ip.strip() != "" and ip is not None:
            result = linecache.getline(self.ip_localization_file, bisect.bisect(self.low_ips_in_ranges, ip_to_int(ip))) \
                .replace('\n', '')
            reader = csv.reader([result])
            row = reader.next()
            geo_loc = ";".join(row[4:6]) + " " + ";".join(row[8:9])
            domain = row[9:10][0]
            result = {"geo_loc": geo_loc, "domain": domain}
        return result
