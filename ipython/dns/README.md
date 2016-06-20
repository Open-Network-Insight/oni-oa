# DNS

oni-oa sub-module for Open-Network-Insight, version 1.0.1

DNS sub-module will extract and transform DNS (Domain Name Service) data already ranked by oni-ml and will load
into csv files for presentation layer.

## Folder Structure

        gti                             -> DNS Global Threat Intelligence python module
                                            | fb               -> GTI sub-module for facebook ThreatExchange
                                            | gti              -> GTI sub-module for McAfee GTI
                                            | gti_config.json  -> Configuration file for GTI module
        iana                            -> DNS Internet Assigned Numbers Authority codes translation python module
                                            | dns-qclass.csv   -> Iana DNS classes
                                            | dns-qtype.csv    -> Iana DNS types
                                            | dns-rcode.csv    -> Iana DNS rcodes
                                            | iana_config.json -> Configuration file for Iana module
        master                          -> Ipython notebook templates
        nc                              -> DNS Network Context python module
                                            | nc_config.json   -> Configuration file for Network Context module
        static                          -> *
        dns_oa.py                       -> DNS oni-oa main script
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

**for UI components read [UI.md](https://github.com/Open-Network-Insight/oni-oa/blob/1.0.1/ipython/dns/UI.md).*  
**for further reference on how to work with the notebooks, please refer to:  
 [Edge Notebook.ipyb](https://github.com/Open-Network-Insight/oni-oa/blob/1.0.1/ipython/dns/EdgeNotebook.md)  
 [Threat_Investigation.ipyb](https://github.com/Open-Network-Insight/oni-oa/blob/1.0.1/ipython/dns/ThreatInvestigation.md)  *
## DNS Components

###dns_oa.py

DNS oni-oa main script.

This script contains the logic to extract and transform data from oni-ml and output results files for UI.
It executes the following steps:

1. Reads a given number of rows from ipython/\<date>/dns_results.csv (DNS oni-ml ML results).
 
2. Checks reputation of destination IP for each connection.
 
3. Add Hour, Severity and Unix Timestamp columns.
 
4. Add IANA codes labels.
 
5. Add Network Context.
 
6. Saves results file.
 
7. Creates a backup of results file.

8. Creates DNS data details.


**Dependencies**

- python 2.7. [Python 2.7](https://www.python.org/download/releases/2.7/) should be installed in the node running DNS OA. 

	The following scripts are already included but some of them require configuration. See the following sections for more information. 
- set_ipython_notebooks.sh
- dns_suspicious_dendrogram.py
- dns_oa_details_dendro.py
- dns_suspicious_details.py
- inscreenlog.py
- git
- iana
- nc

**Pre-requisites**

- [Configure](https://github.com/Open-Network-Insight/open-network-insight/wiki/Install%20OA%20Solution) GIT services
- [Configure](https://github.com/Open-Network-Insight/open-network-insight/wiki/Install%20OA%20Solution) IANA service
- [Configure](https://github.com/Open-Network-Insight/open-network-insight/wiki/Install%20OA%20Solution) Network Context service
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

This script will generate the following text csv files in path ipython/dns/user/\<date>:
- dendro-\<destination ip>.csv: One file for each source IP. This file includes information about all the queries
made by an IP. 

		Schema with zero-indexed columns:
		
		0.dns_a: string
		
		1.dns_qry_name: string
		
		2.ip_dst: string

- edge-\<query>_HH_MM.csv: One file for each query name for each hour of the day. This file contains details for each
connection between DNS and source IP.

		Schema with zero-indexed columns:
		
		0.frame_time: string
		
		1.frame_len: int
		
		2.ip_dst: string
		
		3.ip_src: string
		
		4.dns_qry_name: string
		
		5.dns_qry_class_name: string
		
		6.dns_qry_type_name: string
		
		7.dns_qry_rcode_name: string
		
		8.dns_a: string

- Threat Investigation: One Ipython notebook template for Threat Investigation. 
- dns_scores.csv: One result file with the given number of rows. Also known as suspicious connects.
 
		Schema with zero-indexed columns: 
		
		0.frame_time: string 
		
		1.frame_len: int
		
		2.ip_dst: string
		
		3.dns_qry_name: string
		
		4.dns_qry_class: string
		
		5.dns_qry_type: int
		
		6.dns_qry_rcode: int
		
		7.domain: string
		
		8.subdomain: string
		
		9.subdomain_length: int
		
		10.num_periods: int
		
		11.subdomain_entropy: string
		
		12.top_domain: double
		
		13.word: string
		
		14.score: double
		
		15.query_rep: string
		
		16.hh: string
		
		17.ip_sev: int
		
		18.dns_sev: int
		
		19.dns_qry_class_name: string
		
		20.dns_qry_type_name: string
		
		21.dns_qry_rcode_name: string
		
		22.network_context: string
		
		23.unix_tstamp: bigint

- dns_scores_bu.csv: One backup file of suspicious connects in case user want to roll back any changes made during
analysis. Schema is same as dns_scores.csv.

More information about how to execute DNS [here](https://github.com/Open-Network-Insight/open-network-insight/wiki/Install%20OA%20Solution)

###GTI (gti)
DNS Global Threat Intelligence module.

This module is called in dns_oa.py for IP reputation check. The GTI module makes use of two third-party services, McAfee GTI and Facebook ThreatExchange. Each of these services are represented by a sub-module in this project, McAfee GTI is implemented by sub-module gti and Facebook ThreatExchange by sub-module fb. For more information see Folder Structure section.

More services can be implemented. See _How to implement a new reputation service for DNS OA_ for more information on how to implement a new reputation service.

**Prerequisites**

- McAfee GTI client and credentials. McAfee GTI client is not included in this project. To get a copy of their [rest client](https://secure.mcafee.com/apps/downloads/my-products/login.aspx?region=us) and credentials (server, user, password) get in touch with a McAfee® representative at Licensing@McAfee.com. *If you are not interested on using McAfee GTI or you are not McAfee customer you can always disable McAfee GTI reputation check.*

- Facebook API Key. For Facebook ThreatExchange it's required to obtain first an API Key. To learn more about how to get an API Key go to [Facebook Developers](https://developers.facebook.com/). *If you are not interested on using Facebook ThreatExchange you can always disable ThreatExchange reputation check.*

**Enable/Disable GTI service**

It's possible to disable any of the reputation services mentioned above, all it takes is to remove the configuration for the undesired service in gti_config.json. To learn more about this see the next section.

**Configuration**

- gti_config.json: Stores a list of reputation services to call in dns_oa.py. Also it contains a list of columns to check
 reputation. gti_config.json looks like this:

        {
            "target_columns" : [4], 
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
    These columns should either contain an IP or domain name. By default DNS OA is checking column index 4 that
    corresponds to the destination query name for each event.

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

    - fb: facebook [ThreatExchange](https://developers.facebook.com/products/threat-exchange) service connection details.
        - app_id: App id to connect to ThreatExchange service.
        - app_secret: App secret to connect to ThreatExchange service.

###IANA (iana)
DNS Internet Assigned Numbers Authority codes translation module.

**Configuration**

- iana_config.json:  Stores the location of codes translation files. By default DNS iana module comes with 3 csv files
with different code types for DNS queries and usually they will be located in ~/ipython/dns/iana. These files can be
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

###Network Context (nc)
DNS Network Context module.

**Prerequisites**

Before start working with network context it's required to generate a file with network context information. This file should
contain a list of IPs and its description in a comma separated format and should be called networkcontextDNS.csv. This file can
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
