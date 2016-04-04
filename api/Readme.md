# ONI-OA API 

This module is designed to improve the efficiency and reduce rendering time for the ONI GUI, at the same time allows the system administrator to configure and select the desired database engine to connect and work with to the GUI. 
All the necessary queries for ONI's GUI are already in here, just locate the config/config.json file and update it to match the configuration in your cluster.

## 1. Prerequisites:
* Hadoop 5.4  
* Hive 1.1.0
* Impala 2.2.0
* Python2.7
* pip

**_Note_**: You need to have previously created your HIVE database according to the ONI-OA setup instructions


## 2. Installation & Setup
Install all the required packages:
 
    $ cd your_path/DuxburyBay-Flux/api/
    $ pip install –r requirements.txt 
    $ cd api/config 

Update the config.json file accordingly:

- **DBENGINE**: (Options: 'HIVE' || 'IMPALA') 
- **DEFAULT_DATE**: (Default date to use when none was provided in the GUI)
- **DB_HOST**: (DBE Host)
- **PORT**: (Port enabled for the selected DBE instance)
- **AUTH_MECHANISM**: (Options: 'SASL' || 'NOSASL' || 'PLAIN')
- **LDAP_USER**: (Database user)
- **LDAP_PWD**: (Database password) 
- **IANA_CODES**: (Absolute path to IANA codes catalogs) 
- **LDAP_PWD**: (Database password) 


## 3. Usage
This api implements several endpoints to enable the GUI and are accessible by their endpoints:
 
####get_dns_suspicious
Returns top 250 suspicious dns detected by ML, ordered by most suspcious first and only ones that don't have a score set by the security analyst. This endpoint feeds the 'Suspicious' block from suspicious connects.
    
    http://127.0.0.1:8080/app/api/dns/suspicious/<date>
 
######**Expected parameters:**
- date (Required. As string, format: yyyymmdd}
- ip_dst (Optional)
- dns_qry_name (Optional)

######**Available Methods:**
GET, POST

######**Headers:**
Content=application/json

######**Example:** 
```
	#Request:
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/suspicious/20151113 -d {"ip_dst":"192.0.0.0"} 
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/suspicious/20151113 -d {"ip_dst":"192.0.0.0", "dns_qry_name":"mydomain.com"} 
	#Response:
	{
	  "data": [], 
	  "headers": {
		"dns_qry_class": "dns_qry_class", 
		"dns_qry_name": "dns_qry_name", 
		"dns_qry_rcode": "dns_qry_rcode", 
		"dns_qry_type": "dns_qry_type", 
		"frame_time": "frame_time", 
		"hh": "hh", 
		"ip_dst": "ip_dst", 
		"query_rep": "query_rep", 
		"score": "score"
	  }
	}  
```

####get_dns_details
Returns all additional IP that queried a selected DNS in the timeframe of an hour. This query collects data from the 'raw' data source, so all connections, even if not detected by ML, will be displayed.
This endpoint feeds the Details block from suspicious connects and it's currently limited to 250 rows  
     
     http://127.0.0.1:8080/app/api/dns/details/<date>

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd}
- dns_qry_name (Required)
- time (Optional)

######**Available Methods:**
POST

######**Headers:**
Content=application/json

######**Example:**
```
	#Request
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/details/20151113 -d {"dns_qry_name":"192.0.0.0"} 
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/details/20151113 -d {"dns_qry_name":"192.0.0.0", "time":"23:59"}
	#Response
	{
	  "data": [], 
	  "headers": {
		"dns_a": "dns_a", 
		"dns_qry_class": "dns_qry_class", 
		"dns_qry_name": "dns_qry_name", 
		"dns_qry_rcode": "dns_qry_rcode", 
		"dns_qry_type": "dns_qry_type", 
		"frame_len": "frame_len", 
		"frame_time": "frame_time", 
		"ip_dst": "ip_dst", 
		"ip_src": "ip_src"
	  }
	}
```

####get_dns_details_visual
Returns the list of all DNS queried by an ip and its corresponding answers, this result is displayed as a dendrogram on the Details block, from Suspicious Connects. 

    http://127.0.0.1:8080/app/api/dns/details/visual/<date>

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd}
- ip_dst (Required)
- time (Required. As string, format: hh:mm)

######**Available Methods:**
POST

######**Headers:**
Content=application/json

######**Example:**
```
	#Request
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/details/visual/20151113 -d {"ip_dst":"192.0.0.0", "time":"23:59"} 
	#Response
	{
	  "data": [], 
	  "headers": {
		"dns_a": "dns_a", 
		"dns_qry_name": "dns_qry_name", 
		"ip_dst": "ip_dst"
	  }
	}
```

####get_edge_investigation
Returns the list of non scored suspicious DNS or IPs. This populates the lists on the Edge Investigation notebook for the data scientist to score.

    http://127.0.0.1:8080/app/api/dns/edge/<date>

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd}
- filter (Required. Available values: "ip_dst" | "dns_qry_name")

######**Available Methods:**
POST

######**Headers:**
Content=application/json

######**Example:**
```
	#Request
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/edge/20151113 -d {"filter":"ip_dst"}     
	#Response
	{
	  "data": [], 
	  "headers": {
		"ip_dst": "ip_dst"
	  }
	}
	#Request
	curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/edge/20151113 -d {"filter":"dns_qry_name"}
	#Response
	{
	  "data": [], 
	  "headers": {
		"dns_qry_name": "dns_qry_name"
	  }
	}
```

####get_threat_investigation
This endpoint returns all connections (DNS or IP) scored with severity = 1. This populates the list on the Threat Investigation Notebook. 

    http://127.0.0.1:8080/app/api/dns/threat_investigation/<date>

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd} 

######**Available Methods:**
GET

######**Headers:**
Content=application/json

######**Example:**
```
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/threat_investigation/20151113
```


####get_threat_investigation_comments
For the Threat Investigation Notebook, this endpoint retrieves and stores all comments set for suspicious DNS or IPs.

    http://127.0.0.1:8080/app/api/dns/threat_investigation/comments/<date>

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd} 
- data (Required. Relative path to threat_investigation comments file)

######**Available Methods:**
GET, POST

######**Headers:**
Content=application/json

######**Example:**
```
	#Request
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/threat_investigation/comments/20151113
	#Response
	{
	  "data": [], 
	  "headers": {
		"dns_qry_name": "dns_qry_name", 
		"ip_dst": "ip_dst", 
		"summary": "summary", 
		"title": "title"
	  }
	}
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/threat_investigation/comments/20151113  -d {"data":"/path/to_my/comments.csv"} 
```



####get_threat_investigation_visual
For the StoryBoard, populates data on the Incident Progression block with either:
Case 1. All distinct ip's that have queried the selected dns (dns_qry_name) and have not been commented yet.
Case 2. All dns's with severity = 1 that have been queried by the selected ip (ip_dst) and have not been commented yet.

    http://127.0.0.1:8080/app/api/dns/threat_investigation/visual/<date>

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd} 
- dns_qry_name (Required for case 1)
- ip_dst (Required for case 2)

######**Available Methods:**
POST

######**Headers:**
Content=application/json

######**Example:**
```
	#Request
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/threat_investigation/visual/20151113 -d {"dns_qry_name":"mydomain.com"} 
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/threat_investigation/visual/20151113 -d {"ip_dst":"0.0.0.0"} 
	#Response
	{
	  "data": [], 
	  "headers": {
		"dns_qry_name": "dns_qry_name", 
		"ip_dst": "ip_dst", 
		"sev": "sev", 
		"total": "total"
	  }
	}
```


####insert_scores_file
This endpoint moves the scores file created at the Edge Investigation notebook and loads it into HDFS. 
When Impala is selected as main DBE, ths endpoint also executes the 'Invalidate Metadata' command.

    http://127.0.0.1:8080/app/api/dns/scoring/

######**Expected parameters:**
- date (Required. As string, format: yyyymmdd. This represents the date of the data being scored)
- data (Required. Relative path to file load into hdfs )

######**Available Methods:**
POST

######**Headers:**
Content=application/json

######**Example:**
```
	#Request	
    curl -H "Content=application/json" http://127.0.0.1:8080/app/api/dns/scoring/ -d {"date":"20151113", "data":"/path/to_my/scores_file.csv"} 	
```



## 3. Limitations:
This version has only been tested on Impala and Hive2, on a Cloudera distribution for Hadoop.
Only methods for DNS analysis have been implemented, in future versions this api should include methods for different data types.

## 4. Version
* Version 1.0 - Implemented DNS analysis. Compatibility with Impala and Hive2.