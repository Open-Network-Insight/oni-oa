##DEPENDENCIES
The ipython notebooks run on Jupyter notebooks: http://jupyter.org/  
The following python modules will have to be imported for the notebook to work correctly:  
```
import struct, socket
import numpy as np 
import csv, json 
import os 
import urllib2 
import datetime
import operator
import itertools
import ipywidgets as widgets # For jupyter/ipython >= 1.4
from IPython.html import widgets
from IPython.display import display, Javascript, clear_output
```

##DATA  

The whole process in this notebook depends entirely on the existence of the scored `flow_scores.csv` file, which is generated at the OA process, and scored at the Edge Investigation Notebook.
Optinally, a geolocation file and a network context file can be included to display more relevant information on the threats.

**Source paths:**   
`ipython/dns/user/<date>/`  

**Input files**
```
ipython/dns/user/<date>/dns_scores.csv  
```

**Output files**
``` 
ipython/dns/user/<date>/threats.csv
ipython/dns/user/<date>/threat-dendro-<threat>.csv
```

**HDFS tables consumed**
``` 
dns
```

##FUNCTIONS  

`start_investigation():` - This function cleanes the notebook from previous executions; reads the _dns_scores.csv_ file to find all 'ip_dst' values where 'ip_sev' = 1, and the 'dns_qry_name' where 'dns_sev' = 1, creating a dictionary with those values and invoque the "display_controls()" function.

`display_controls(ip_list):` - This function will create, initialize and display the ipython widgets with the previously collected data. 
The widgets include:   
- Listbox with all high risk threats.  
- "Search" button.

`search_ip(b):` - This function is triggered by the click event of the "Search" button. This will get the selected value from the listbox and perform a query to the _dns_ table to retrieve all comunication involving that IP/Domain during the day with any other IPs or Domains. 
The results are stored in the _threat-dendro-&lt;threat&gt;.csv_ file.  Afterwards it will read through this file to print an html table with the top 'n' results, ordered by amount of connections, listing the most active connections first. Here the "display_threat_box()" function will be invoqued. 

`display_threat_box(ip):` - Generates and displays the widgets for "Title" and "Comments" textboxes and the "Save" button on the notebook, so the user can add comments on the threat and save them to continue with the analysis.

`save_threat_summary(b):` - This function is triggered by the click event on the "Save" button. This function will read the contents of the form and create/update the _threats.csv_ file, appending a new line with the content for each threat scored.
 
`file_is_empty(path):` - Performs a validation to check the file of a size to determine if it is empty.
 
`removeWidget(index):` - Javascript function that removes a specific widget from the notebook. 