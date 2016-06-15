# Dns

oni-oa sub-module for Open-Network-Insight, version 1.0.1

Dns sub-module will extract and transform DNS (Domain Name Service) data already ranked by oni-ml and will load
into csv files for presentation layer.

## Folder structure

        gti                             -> Dns Global Threat Intelligence python module
                                            | fb               -> GTI sub-module for facebook ThreatExchange
                                            | gti              -> GTI sub-module for McAfee GTI
                                            | gti_config.json  -> Configuration file for GTI module
        iana                            -> Dns Internet Assigned Numbers Authority codes translation python module
                                            | dns-qclass.csv   -> Iana Dns classes
                                            | dns-qtype.csv    -> Iana Dns types
                                            | dns-rcode.csv    -> Iana Dns rcodes
                                            | iana_config.json -> Configuration file for Iana module
        master                          -> Ipython notebook templates
        nc                              -> Dns Network Context python module
                                            | nc_config.json   -> Configuration file for Network Context module
        static                          -> *
        dns_oa.py                       -> Dns oni-oa main script
        dns_oa_details_dendro.py        -> Script that queries raw data and extracts DNS details. This
                                           data is used to build dendro diagram
        dns_suspicious_dendrogram.py    -> Wrapper for dns_oa_details_dendro.py and dns_suspicious_details
        dns_suspicious_details.py       -> Script that queries raw data and extracts DNS detailed information of each
                                           connection
        index_sdns.html                 -> *
        inscreenlog.py                  -> Helper to print logs
        set_ipython_notebooks.sh        -> Bash script that will create all required folders to store dns_oa.py results
        story_board.html                -> *
        threat_investigation.html       -> *

**for UI componentes read [UI.md](https://github.com/Open-Network-Insight/oni-oa/blob/1.0.1/ipython/dns/UI.md).*
## Dns components

###dns_oa.py

Dns oni-oa main script.

This script contains the logic to extract and transform data from oni-ml and output results files for UI.
It executes the following steps:

1. Reads a given number of rows from ipython/\<date>/dns_results.csv (Dns oni-ml ML results).
 
2. Checks reputation of destination IP for each conneciton.
 
3. Add Hour, Severity and Unix Timestamp columns.
 
4. Add Iana codes labels.
 
5. Add Network Context.
 
6. Saves results file.
 
7. Creates a backup of results file.

8. Creates DNS data details.


**Dependencies**

- python 2.7
- set_ipython_notebooks.sh
- dns_suspicious_dendrogram.py
- dns_oa_details_dendro.py
- dns_suspicious_details.py
- inscreenlog.py
- git
- iana
- nc

**Pre-requisites**

- Configure gti services ADD LINK TO HOW TO CONFIGURE DNS OA
- Configure iana service ADD LINK TO HOW TO CONFIGURE DNS OA
- Configure network context service ADD LINK TO HOW TO CONFIGURE DNS OA
- Generate ML results for DNS

**Usage**

    [solution-user@edge-server]$ python2.7 dns_oa.py -d YYYYMMDD -i <dns ipython location> -l <record limit>

**Example**

    [solution-user@edge-server]$ python2.7 dns_oa.py -d 20160613 -i /home/oni-user/ipython/dns -l 3000


**Parameters**

    -d: Date of machine learning results that are going to be processed, format should be Year (4 digits),
        Month (2 digits) and Day (2 digits). If there is no data for this parameter dns_oa.py will just exit with message
        "No data found".
    -i: The absolute path for ipython notebooks for DNS. Usually this folder should be under /home/oni-user/ipython/dns.
    -l: The number of records from machine learning results table you want to process and send to the next stage.
        This data will be saved into a new file.
    -h: Will display usage.

**Output**

This script will generate the following files in path ipython/dns/user/\<date>
- dendro-\<destination ip>.csv: One file for each IP doing queries. This file includes information about all the queries
made by an IP to a DNS server.
- edge-\<query>_HH_MM.csv: One file for each query name for each hour of the day. This file contains details for each
connection between DNS and source IP.
- Threat_Investigation.ipyb: One Ipython notebook template for Threat Investigation.
- dns_scores.csv: One result file with the given number of rows. Also known as suspicious connects.
- dns_scores_bu.csv: One backup file of suspicious connects in case user want to roll back any changes made during
analysis.

More information about how to execute Dns OA in ADD LINK

###gti
Dns Global Threat Intelligence module.

This module is called in dns_oa.py for IP reputation check. At the same time gti module will calls two third party services,
one is McAfee GTI service and the other one is facebook ThreatExchange. Each of these services are represented by a
sub-module, McAfee GTI as gti and facebook ThreatExchange as facebook.

More services can be implemented.

**Configuration**

- gti_config.json: Stores a list of reputation services to call in dns_oa.py. Also it contains a list of columns to check
 reputation. gti_config.json looks like this:

        {
            "target_columns" : [3],
            "gti":{
            "server" : "<server>",
            "user" : "<user>",
            "password" : "<password>",
            "ci" : "{\"ci\":{\"cliid\":\"<cliid>\", \"prn\":\"<prn>\", \"sdkv\":\"1.0\", \"pv\":\"1.0.0\", \"pev\":1, \"rid\":1, \"affid\":\"0\"},\"q\":[###QUERY###]}",
            "refclient" : "<refclient location>"
            },
            "fb":{
                "app_id" : "<app_id>",
                "app_secret" : "<app_secret>"
            }
        }
    Where
    - target_columns: is an array of column indexes that are going to be checked by each reputation service.
    These columns should either contain an IP or domain name. By default Dns OA is checking column index 3 that
    corresponds to the destination IP in the registered event.

    - gti: McAfee GTI service connection details.
        - server: string with McAfee GTI server.
        - user: string with McAfee GTI user.
        - password: string with McAfee GTI password.
        - ci: request body for GTI service. This string parameter is formatted as json content,
        be careful with removing scape characters for single quotes and double quotes.

            Do not remove, replace or modify the label ###QUERY###, it's a special placeholder and is required for
        reputation.py to work.
        - prn: you can give a name to your Oni instance like "CompanyX-Oni" or you can just leave as Oni.
        - refclient: absolute path for restclient. It should be the path where the *restclient* file is
        located without ending backslash i.e.

                /home/solution-user/refclient/restclient
        *Note: GTI rest client is not included in this project.
To get a copy of this [restclient](https://secure.mcafee.com/apps/downloads/my-products/login.aspx?region=us) and
connection details (server, user, password) get in touch with your McAfee® representative at Licensing@McAfee.com.
If you are not planning to use McAfee GTI you can simply remove the entire "gti" configuration from gti_config.json.*

    - fb: facebook [ThreatExchange](https://developers.facebook.com/products/threat-exchange) service connection details.
        - app_id: App id to connect to ThreatExchange service.
        - app_secret: App secret to connect to ThreatExchange service.

        *To learn more about how to get an API Id and API secret go to facebook developers
        [site](https://developers.facebook.com/). If you are not planning to use facebook ThreatExchange service simply
        remove the entire "fb" configuration from gti_config.json*

 **Sub-modules**

 Dns GTI comes with two sub-modules and they correspond to the reputation services we are supporting by default.
  - gti: implements logic to call and return results from McAfee reputation service.
  - fb: implements logic to call and return results from facebook ThreatExchange reputation service.

 It's possible to add new reputation services by implementing a new sub-module, to do that developers should follow
 these steps:

1. Map the responses of the new reputation service with Dns reputation table.

    |   |   |
    |---|---|
    |UNVERIFIED|-1|
    |NONE      |0 |
    |LOW       |1 |
    |MEDIUM    |2 |
    |HIGH      |3 |

2. Add a new configuration for the new reputation service in gti_config.json.

        {
			"targe_columns" :  [3],
			"gti" : { …
			},
			"fb" : {…
			},
			"mynewreputationservice":{ "server" : "rep.server.com",
				                        "user" : "user-name"
			}
		}
3. Create file structure for new sub-module.

        [solution-user@edge-server]$ cd ~/ipython/dns/gti/
        [solution-user@edge-server]$ mkdir mynewreputationservice
        [solution-user@edge-server]$ cd mynewreputationservice

4. Add _ _init_ _.py file.
5. Add a new file *reputation.py*. Each sub-module should contain a reputation.py file.
6. Write your code in reputation.py. The code should contain the follow structure:

    6.1 Constructor:

    Constructor should receive one *config* parameter. This parameter correspond to the specific configuration of the
    service in gti_config.json. When running, dns_oa.py will iterate through each service in the configuration file
    and create a new instance of each sub-module sending the corresponding configuration for each new instance.

        def __init__(sel,conf):
            #TODO: read configuration.
            # i.e.
            # self._server = configuration['sever']
            # self._user = configuration['user']

    6.2 Implement *check* method:

    Check method should receive a list of urls or IPs to be evaluated and return a dictionary with each element's
    reputation in the following format {"url":"reputation"}.
    *Reputation* should be a string with 3 elements separated by colon **":"** where the first part is the reputation
    service name, second the reputation label and third the reputation value already defined in step 1.

        def check(self,url_list):
            # connect to service
            # call service for each url in list or bulk query
            # translate results to service:label:value format
            # create new entry to result dictionary {"url":"service:label:value"}
            # return a dictionary with each url from url_list and the corresponding reputation

     Result example:

        {
            "dns.somethin.com" : "mynewreputationservice:MEDIUM:2",
			"other.dns.test.org" : "mynewreputationservice:LOW:1",
			"someother.test.com" : "mynewreputationservice:HIGH:3"
		}

To stop using any of the reputation services in GTI module simply remove the configuration for the service in
gti_config.json.

###iana
Dns Internet Assigned Numbers Authority codes translation module.

**Configuration**

- iana_config.json:  Stores the location of codes translation files. By default Dns iana module comes with 3 csv files
with different code types for dns queries and usually they will be located in ~/ipython/dns/iana. These files can be
moved to any preferred location.

To configure replace each value with the absolute path for each IANA codes file, for example if IANA code files are in the
default location, your configuration file should look like this:

		{
		    "IANA": {
	             "dns_qry_class":"/home/solution-user/ipython/dns/iana/dns-qclass.csv",
	             "dns_qry_type":"/home/solution-user/ipython/dns/iana/dns-qtype.csv",
	              dns_qry_rcode":"/home/solution-user/ipython/dns/iana/dns-rcode.csv"
	          }
		 }

###nc
Dns Network Context module.

**Prerequisites**

Before start working with network context it's required to generate a file with network context information. This file should
contain a list of IPs and Description in a comma separated format and should be called networkcontextDNS.csv. This file can
be placed anywhere in the system running dns_oa.py.

Example:

        IP,Description
        10.10.1.1,my.example.company.com
	    10.1.10.1,myotherexample.company.bu.com
	    10.18.132.1,onemore.company.name.com

**Configuration**

- nc_config.json: replace the value of network_context_dns with the absolute path of networkcontextDNS.csv, the
configuration file should look like this:

		{
		    NC" : {
				        "network_context_dns" : "/home/solution-user/files/networkcontextDNS.csv"
			   }
		 }
