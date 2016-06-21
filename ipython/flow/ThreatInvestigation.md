##DEPENDENCIES
The ipython notebooks run on Jupyter notebooks: http://jupyter.org/  
The following python modules will have to be imported for the notebook to work correctly:  
```
import struct, socket
import numpy as np
import linecache, bisect
import csv
import operator
import json
import os
import ipywidgets as widgets # For jupyter/ipython >= 1.4
from IPython.html import widgets
from IPython.display import display, Javascript, clear_output
```

##DATA  

The whole process in this notebook depends entirely on the existence of the scored `flow_scores.csv` file, which is generated at the OA process, and scored at the Edge Investigation Notebook.
Optinally, a geolocation file and a network context file can be included to display more relevant information on the threats.

**Source paths:**   
`ipython/user/<date>/`  
`ipython/iploc/`  

**Input files**
```
ipython/user/<date>/flow_scores.csv  
ipython/iploc/iploc.csv
ipython/iploc/networkcontext_1.csv
```
**Output files**
``` 
ipython/user/<date>/threats.csv  
ipython/user/<date>/threat_<ip>.csv  
ipython/user/<date>/sbdet-<ip>.tsv  
ipython/user/<date>/globe_<ip>.json  
ipython/user/<date>/stats-<ip>.json  
ipython/user/<date>/dendro-<ip>.json  
```
**HDFS tables consumed**
``` 
flow
```
###File Format  
**_networkcontext_1.csv_**  
This is a comma separated file, and is expected to have only two columns:  
- srcIP (string)
- name (string)

Where _srcIP_ is the IP or IPs that can be grouped into the same context in the network. This column can have one of the following formats:
- IP range (192.0.54.0-192.0.54.254)  
- Subnets 192.0.54.0/24 (192.0.54.0-192.0.54.254)    
- Unique IP  

While _name_ is a short description of the context.    


**_iploc.csv_**  
This is a comma separated geolocation database file, containing all (or most) known public IP ranges and the details of its location.  
The following columns are expected:  
- IP Range start (double)
- IP Range end (double)
- Country code (string)
- Country (String)
- State (string)
- City (string)
- Latitude (float)
- Longitude (float)
- Owner or Register (string)
- Domain name (string)  
 

##FUNCTIONS  

`display_controls():` - This function will display the jupyter widgets with the listbox of high risk IP's and the "Search" button.

`search_ip()` - This function is triggered by the click event on the "Search" button after selecting an IP from the listbox. This will get the selected IP from the listbox and perform a query to the _flow_ table to retrieve all comunication involving that IP during the day with any other IPs. 
The results are stored in the _ir-&lt;ip&gt;.csv_ file.

`display_expanded_search():` - This function reads through the _flow&#95;scores.csv_ file, filtering only the connections scored as high risk (sev = 1) and selecting the values from 'srcIp' and 'dstIP' columns. 

`display_threat_box():` - Generates and displays the widgets for "Title", "Comments" textboxes and the "Save" button on the notebook, so the user can add comments on the threat and save them to continue with the analysis.  

`get_in_out_and_twoway_conns():` - With the results from the expanded search, this function will loop through each connection and depending if each IP appears only as src, dst or both the system will section them into three dictionaries, each containing:
-	All unique ‘inbound’ connected IP's (Where the internal sought IP appears only as destination, or the opposite if the IP is external)  
-	All unique ‘outbound’ connected IP's (Where the internal sought IP appears only as source, or the opposite if the IP is external)
-	All unique ‘two way’ connected IP's (Where the sought IP appears both as source and destination) 

`add_network_context` - This function depends on the existence of the _networkcontext\_1.csv_ file. This will read through every dictionary looking for each IP in the ranges defined in the context file, and updating its data accordingly. If the networkcontext file doesn't exist, this function will be skipped.

`generate_attack_map_file(ip, inbound, outbound, twoway): `- This function depends on the existence of the _iploc.csv_ file. Using the geospatial info added to the dictionaries, this function will create the _globe.json_ file. If the iploc file doesn't exist, this function will be skipped.

`add_geospatial_info()` - This function depends on the existence of the _iploc.csv_ file. This will read through the dictionaries created, looking for every IP and updating its geolocation data according to the iploc database. If the iploc file doesn't exist, this function will be skipped.

`add_threat(ip,threat_title):`- Creates or updates the _threats.csv_ file, appending the IP and Title from the form. This will serve as the index for the Story Board.

`save_threat_summary()` - This function is triggered by the click event on the "Save" button. This function will read the contents of the "Expanded search" form and create a _threat&#95;&lt;ip&gt;.csv_ file with that content for each threat scored. 

`details_inbound(ip, inbound):` -  This function executes a query to the _flow_ table looking for all additional information between the shought IP (threat) and the IP's in the 'inbounds' dictionary. The results will be stored in the _sbdet-&lt;ip&gt;.tsv_ file.
 
`generate_dendro(ip, inbound, outbound, twoway, date):` - This function groups the results from all three dictionaries into a json file, adding an additional level if the dictionaries include network context for each IP. The results are stored in the _dendro-&lt;ip&gt;.json_ file .

`generate_stats(ip, inbound, outbound, twoway, threat_name):` - This function reads through each of the dictionaries to group the connections by type. The results are stored in the _stats-&lt;ip&gt;.json_ file. 

`get_top_bytes(conns_dict, top):` - Orders a dictionary descendent by number of bytes, returns a dictionary with the top 'n' values. This dictionary will be printed onscreen, listing the most active connections first.   

`get_top_conns(conns_dict, top):` - Orders a dictionary descendent by number of connections executed, returns a dictionary with the top 'n' values. This dictionary will be printed onscreen, listing the most active connections first.   

`file_is_empty(path):` - Performs a validation to check the file of a size to determine if it is empty.
 
`removeWidget(index):` - Javascript function that removes a specific widget from the notebook.
 
`get_ctx_name(full_context): ` **Deprecated**    
