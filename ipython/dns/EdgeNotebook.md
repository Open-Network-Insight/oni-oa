##DEPENDENCIES
The ipython notebooks run on Jupyter notebooks: http://jupyter.org/  
The following python modules will be imported for the notebook to work correctly:    
```
import urllib2  
import json  
import os  
import csv  
import ipywidgets #For jupyter/ipython >= 1.4  
from IPython.html import widgets # For jupyter/ipython < 1.4  
from IPython.display import display, HTML, clear_output, Javascript   
import datetime  
import subprocess 
```


##DATA  

The whole process in this notebook depends entirely on the existence of `dns_scores.csv` file, which is generated at the OA process.  
The data is directly manipulated on the .csv files, so a `dns_scores_bu.csv` is created as a backup to allow the user to restore the original data at any point, 
and this can be performed executing the last cell on the notebook with tthe following command.  
```
!cp $sconnectbu $sconnect
```

**Source path:**   
`ipython/dns/user/<date>/`  

**Input files**
```
ipython/dns/user/<date>/dns_scores.csv  
ipython/dns/user/<date>/dns_scores_bu.csv
```
**Temporary Files**
```
ipython/dns/user/<date>/dns_scores_tmp.csv
```
**Output files**
```
ipython/dns/user/<date>/dns_scores.csv (Updated with scores)
```

##FUNCTIONS  
**Data loader**
````
data_loader():
````
This function reads the `dns_scores.csv` file to list all suspicious unscored connections, creating separated lists for 
IP's and Queries. Also displays the widgets for the listboxes, textbox, radiobutton list and the 'Score' and 'Save' buttons.  
  
  
**Fill List**
```` 
fill_list(list_control,source):
````
This function assigns a data source to a listbox and appends an empty item at the top. 
  
   
**Score**
````   
assign_score(b):
````  
This event is executed when the user clicks the ‘Score’ button. The system will first try to get the value from the 'Quick search' textbox ignoring the selections from the listboxes; in case the textbox is empty, it will then
 get the selected values from the 'Client IP' and 'Query' listboxes to then search through the dns_scores.csv file to find matching values. 
A linear search on the file is then performed:  
- The value in the 'Quick Scoring' textbox, will be compared against the `dns_qry_name` column. Partial matches will be considered as a positive match and the `dns_sev` column will be updated to the value selected from the radiobutton list. 
- The column `ip_dst` will be compared against the 'Client IP' selected value; if a match is found, the `ip_sev` column will be updated to the value selected from the radiobutton list.  
- The column `dns_qry_name` will be compared against the 'Query' selected value; if a match is found, the `dns_sev` column will be updated to the value selected from the radiobutton list.   
- Every row will be appended to the `dns_scores_tmp.csv` file. This file will replace the original `dns_scores.csv` at the end of the process.  

**Save**
```` 
save(b):
````
This event is triggered by the 'Save' button, and executes javascript functions to refresh the data on all the panels in Suspicious Connects. Since the data source file has been updated, the scored connections will be removed from all
the panels, since those panels will only display connections where the `dns_sev` value is zero.
This function also removes the widget panel and reloads it again to update the results, without having to run all cells in the notebook.

**ML Feedback**
````
ml_feedback():
````
A shell script is executed to copy the file with the scored connections to the ML node and its specific path. 
The following variables will be obtained from the configuration file:  
- LUSER  
- MLNODE   
- LPATH  

Also, a ssh key needs to exist between the current node where the UI is running and the ML node 
in order to avoid authentication erros when the secure copy is being performed.
To learn more on how to create and copy the ssh key, please refer to the ["Configure User Accounts"]  
   