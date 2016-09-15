# DNS

oni-oa sub-module for Open-Network-Insight, version 1.1

DNS sub-module will extract and transform DNS (Domain Name Service) data already ranked by oni-ml and will load into csv files for presentation layer.

## DNS Components

###dns_oa.py

DNS oni-oa main script.

This script contains the logic to extract and transform data from oni-ml and output results files for UI.
It executes the following steps:


		1. Creates the right folder structure to store the data and the ipython notebooks. This is: 
		
			data: data/dns/<date>/
			ipython Notebooks: ipynb/dns/<date>/
		
		2. Creates a copy of the notebooks templates into the ipython Notebooks path and renames them removing the "_master" part from the name.
		
		3. Gets the proxy_results.csv from the HDFS location according to the selected date, and copies it back to the corresponding data path.
		 
		4. Reads a given number of rows from the results file.
		 
		5. Checks reputation for the query_name of each connection.
		 
		6. Adds tow new columns for the severity of the query_name and the client ip of each connection.

		7. Adds a new column with the hour part of the frame_time.
		 
		8. Translates the 'dns_query_class', 'dns_query_type','dns_query_rcode' to human readable text according to the IANA protocol. The translated values are stored in the dns_qry_class_name, dns_qry_type_name, dns_qry_rcode_name columns, respectively. 
		 
		9. Adds Network Context.
		
		10. Saves dns_scores file.
		 
		10. Creates a backup of dns_scores file.
		
		11. Creates dns data detail files.
		
		12. Creates dendrogram data files.


**Dependencies**

Before running Flow OA users need to configure components for the first time. Is important to mention that configuring these components make them work for other data sources as Flow and Proxy.

- python 2.7. [Python 2.7](https://www.python.org/download/releases/2.7/) should be installed in the node running Proxy OA. 

	The following modules are already included but some of them require configuration. See the following sections for more information. 
- [components/iana](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/proxy#IANA-iana)
- [components/data](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/proxy#data)
- [components/nc](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/proxy#Network-Context-nc)
- [components/reputation](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/components#Reputation)
- dns_conf.json

    
**Pre-requisites**

- Configure database engine
- Configure GIT services
- Configure IANA service
- Configure Network Context service
- Generate ML results for DNS
  

**Output**

- dns_scores.csv: One result comma separated file with the given number of rows. Also known as suspicious connects.
 
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


- dendro-\<destination ip>.csv: One file for each source IP. This file includes information about all the queries
made by an IP. 

		Schema with zero-indexed columns:
		
		0.dns_a: string		
		1.dns_qry_name: string		
		2.ip_dst: string

- edge-\<query>_\<HH>_00.csv: One file for each query name for each hour of the day. This file contains details for each
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


###dns_conf.json
This file is part of the initial configuration for the proxy pipeline. Here you'll find mapped all the columns included in the proxy_results.csv and proxy_scores.tsv files.

This file contains three main arrays:

	-  dns_results_fields: Reference of the column name and indexes in the proxy_results.csv file.	 
	-  dns_score_fields:  Reference of the column name and indexes in the proxy_scores.tsv file.	
	-  add_reputation: According to the dns_results.csv file, this is the column index of the value which will be evaluated using the reputation services.


### ipynb_templates### ipynb_templates
Templates of notebooks are stored in this folder and these will be replicated to a the python Notebooks path every time the OA process is executed. If a new functionality is required for the ipython notebooks, the templates need to be updated accordingly to include that functionality in future executions. For further reference on how to customize the notebooks, please refer to:

[Edge Notebook.ipynb](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/dns/ipynb_templates/EdgeNotebook.md)  
[Threat_Investigation.ipynb](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/dns/ipynb_templates/ThreatInvestigation.md)