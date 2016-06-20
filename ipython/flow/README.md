# **OA for Flow**

OA Flow uses the ranked data from ML output, OA Flow process includes reputation and data transformation to human readable format (csv). 
The output data will be used by the presentation layer (suspicious connects, network view, suspicious details).

Flow OA is divided into three main functionalities:

## **STEP 1: LDA Ranking:**

        File: lda_ranking.py

        Parameters: 
                * date: date to process
                * user path: user directory where the script is running
                * input file: machine learning output file (flow_results.csv)
                * output file: flow_scores.csv
                * limit: number of suspicious connects to process.

        What it does: 
                * Creates date folder for OA results .
                * Creates copies of ipython notebooks(edge investigation and threat investigation).     
                * Creates flow_scores.csv file based on ldaFlowConfig.json file. 

### **IPython Nootebooks**
Templates of notebooks are stored in the **master** folder.
If a new functionality is required for the ipython notebook, the templates need to be modified to include the functionality for new executions.

### **STEP 2: Network Context and Reputation Services**

        File: add_nc_and_rep_services.py

        Parameters: 
                * date: date to process
                * user path: user directory where the script is running

        What it does:
                * Adds reputation (GTI, Norse)
                * Adds networkcontext.
                * Adds GEO localization.

###**Reputation Services**

**GTI**

McAfee GTI client is not included in this project. 
To get a copy of their [rest client](https://secure.mcafee.com/apps/downloads/my-products/login.aspx?region=us) and credentials (server, user, password) get in touch with a McAfee® representative at Licensing@McAfee.com. 
If you are not interested on using McAfee GTI or you are not McAfee customer you can still run OA, this part of the code will be ignored.

**GTI configuration**

* **Rest client path:** It should be the path where the restclient file is located without ending backslash i.e. 
Add restclient to the user path: _/home/solution-user/refclient/restclient_
* **GTI connection details**:
        server: string with McAfee GTI server.
        user: string with McAfee GTI user.
        password: string with McAfee GTI password.

**Network context**

To add network context Flow OA uses IP_renges.csv file located in ipython/iploc/IP_ranges.csv.

**GEO Localization**

GEO Localization file is not included in this project. If you have you GEO localization file please add it to: ipython/iploc/iploc.csv. 
This file needs to be comma separated. 

### **STEP 3: Connection details and chord diagrams**

        File: suspicious_connects_op.py

        Parameters: 
                * date: date to process
                * user path: user directory where the script is running

        What it does:
                * Creates connections details file (edge files)
                * Creates chord diagrams.

       

