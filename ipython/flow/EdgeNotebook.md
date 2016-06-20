##DEPENDENCIES
The ipython notebooks run on Jupyter notebooks: http://jupyter.org/  
The following python modules will have to be imported for the notebook to work correctly:  
```
import struct, socket
import shutil
import numpy as np
import pandas as pd
import linecache, bisect
import csv
import operator
import os, time, subprocess
import ipywidgets #For jupyter/ipython >= 1.4  
from IPython.html import widgets #For jupyter/ipython < 1.4  
from IPython.display import display, HTML, clear_output, Javascript   
```

##DATA  

The whole process in this notebook depends entirely on the existence of `flow_scores.csv` file, which is generated at the OA process at the path.  
The data is directly manipulated on the .csv files, so a `flow_scores_bu.csv` on the same path is created as a backup to allow the user to restore the original data at any point, 
and this can be performed executing the last cell on the notebook with the following command:  
```
!cp $sconnectbu $sconnect
```

**Source path:**   
`ipython/user/<date>/`  

**Input files**
```
ipython/user/<date>/flow_scores.csv  
ipython/user/<date>/flow_scores_bu.csv
```
**Temporary Files**
```
ipython/user/<date>/flow_scores.csv.tmp
```
**Output files**
```
ipython/user/<date>/flow_scores.csv (Updated with scores)
```

##FUNCTIONS  
**Data loader**
````
displaythis():
````
This function reads the `flow_scores.csv` file to list all suspicious unscored connections, creating a separated lists for:
- Source IP
- Destination IP
- Source port
- Destination port  

These values are separated into different lists to help the user narrow down the selection and score more specific connections by combining the values from the lists.   

**Score connections**
```` 
update_sconnects(list_control,source):
````  
This event is executed when the user clicks the ‘Assign’ button. The system will first try to get the value from the 'Quick IP Scoring' textbox ignoring the selections from the listboxes; in case the textbox is empty, it will then
 get the selected values from each of the listboxes to look them up in the flow_scores.csv. 
A binary search on the file is then performed:  
- The value in the 'Quick IP Scoring' textbox, will be compared against the `ip_src` and `ip_dst` columns; if either column is a match, the `sev` column will be updated with the value selected from the radiobutton list. 
- The column `srcIP` will be compared against the 'Source IP' selected value.  
- The column `dstIP` will be compared against the 'Dest IP' selected value. 
- The column `sport` will be compared against the 'Src Port' selected value.
- The column `dport` will be compared against the 'Dst Port' selected value.  

Every row will be then appended to the `flow_scores.csv.tmp` file, but only those that match all the selected values from the listboxes will be updated to the risk selected from the radiobutton list. This `.tmp` file will replace the original `flow_scores.csv` at the end of the process.   

**Set custom rules**
````
set_rules():
````
Predefined function where the user can define custom rules to be initally applied to the dataset.

**Execute rules**
````
apply_rules(rops,rvals,risk):
````
This function applies the rules defined inside the `set_rules()` function and
updates the `flow_scores.csv` file following a similar process to the `update_sconnects()` function.


**Heuristic analysis**
````
attack_heuristics():
````
This function is executed at the start, and loads the data from `flow_scores.csv` into a dataframe
grouped by `srcIp` column, to then print only those IP's that connect to more than 'n' other different IP's. By default, n=20, but this value can be set updating


**Save**  
```` 
savesort(b):
````
This event is triggered by the 'Save' button, and executes javascript functions to refresh the data on all the panels  in Suspicious Connects accordingly to the changes on the `flow_scores.csv` file, removing all connections scored as 1 from all the panels, since those panels will only display the top 250 connections where the `sev` value is zero.  
this function also reorders the same file by moving all scored connections to the end of the file and sorting
the unscored connections by `lda_score` column.    
Finally, removes the widget panel and reloads it again to update the results, without having to 
run all cells in the notebook.  
  
**ML Feedback**
````
ml_feedback():
````  
A shell script is executed to copy the file with the scored connections to the ML node and its specific path. 
The following variables will be obtained from the configuration file:  
- LUSER  
- MLNODE  
- LPATH  

Also, a ssh key needs to exist between the current node where the UI is running and the ML node in order to avoid authentication errors when the secure copy is being performed.
To learn more on how to create and copy the ssh key, please refer to the ["Configure User Accounts"]  
 