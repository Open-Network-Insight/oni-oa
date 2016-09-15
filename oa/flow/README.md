# **Flow OA**

oni-oa sub-module for Open Network Insight, version 1.1

Flow OA reads output from oni-ml transform to human readable format (csv). 
The output data will be used by the presentation layer (suspicious connects, network view, suspicious details).

For more information about how this module is executed go to [oa/README.md](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/README.md)

## **Flow OA Components**

### flow_oa.py
Flow oni-oa main script

    1. Creates required folder structure if does not exist for output files. This is: 
		
                data: data/flow/<date>/
                ipython Notebooks: ipynb/flow/<date>/

    2. Creates a copy of iPython notebooks out of templates in ipynb_templates folder into output folder.
    3. Reads Flow oni-ml results for a given date and loads only the requested limit.
    4. Add network context to source and destination IPs.
    5. Add geolocalization to source and destination IPs.
    6. Saves transformed data into a new csv file, this file is called flow_scores.csv.
    7. Creates details files. These details include information about each suspicious connect and connections information
       to draw chord diagram.

**Dependencies**

-  python 2.7. [Python 2.7](https://www.python.org/download/releases/2.7/) should be installed in the node running Flow OA.

The following files and modules are already included but some of them require configuration. See the following sections for more information:
- [components/nc](https://github.com/Open-Network-Insight/oni-oa/tree/1.1/oa/components)
- [components/geoloc](https://github.com/Open-Network-Insight/oni-oa/tree/1.1/oa/components)
- [components/reputation](https://github.com/Open-Network-Insight/oni-oa/tree/1.1/oa/components)
- flow_config.json

The following files are not included:
- [context/iploc.csv](https://github.com/Open-Network-Insight/oni-oa/tree/1.1/context)
- [context/ipranges.csv](https://github.com/Open-Network-Insight/oni-oa/tree/1.1/context)

**Pre-requisites**

Before running Flow OA users need to configure components for the first time. Is important to mention that configuring these components make them work for other data sources as DNS and Proxy.
- Configure reputation module components/reputation
- Configure network context module components/nc
- Configure geo localization module components/geo
- Create iploc.csv file context/iploc.csv
- Generate ML results for Flow

**Output**

- flow_scores.csv. Main results file for Flow OA. This file will contain suspicious connects information and it's limited to the number of rows the user selected when running [oa/start_oa.py](https://github.com/Open-Network-Insight/oni-oa/tree/1.1/oa).
       
        Schema with zero-indexed columns:
        0.   sev:            int
        1.   tstart:         string
        2.   srcIP:          string
        3.   dstIP:          string
        4.   sport:          int
        5.   dport:          int
        6.   proto:          string
        7.   flag:           string
        8.   ipkt:           bigint
        9.   ibyt:           bigint
        10.  lda_score:      double
        11.  rank:           int
        12.  srcIpInternal:  bit
        13.  destIpInternal: bit
        14.  srcGeo:         string
        15.  dstGeo:         string
        16.  srcDomain:      string
        17.  dstDomain:      string
        18.  srcIP_rep:      string
        29.  dstIP_rep:      string
       
- flow_scores_bu.csv. Backup file for flow_scores.csv in case user needs to rollback the scoring or the changes made during analysis. Schema it's same as flow_scores.csv.

- edge-\<source IP>-\<destination IP>-\<HH>-\<MM>.csv. Edge files. One for each suspicious connection containing the detail of each connection occurred between source IP and destination IP during a particular minute.

        Schema with zero-indexed columns:
        0.  tstart:     string
        1.  srcip:      string
        2.  dstip:      string
        3.  sport:      int
        4.  dport:      int
        5.  proto:      string
        6.  flags:      string
        7.  tos:        int
        8.  bytes:      bigint
        9.  pkts:       bigint
        10. input:      int
        11. output:     int
        12. rip:        string

- chord-\<client ip>.tsv. Chord files. One for each distinct client ip. This files contain details of packages and data transferred between the client ip and every other ip it connected.

        Schema with zero-indexed columns:
        0.  srcip:      string
        1.  dstip:      string
        2.  maxbyte:    bigint
        3.  avgbyte:    double
        4.  maxpkt:     bigint
        5.  avgpkt:     double
        
### flow_config.json

Flow oni-oa configuration. Contains column name and indexes for source and output files.
This Json file contains 3 main attributes:
   
    - flow_results_fields: list of column name and index of ML flow_results.csv file. Flow OA uses this map to reference columns by name.
    - column_indexes_filter: the list of indices to take out of flow_results_fields for OA process. 
    - flow_score_fields: list of column name and index for flow_score.csv. After the OA process completes more columns are added.
        


### ipynb_templates
Templates for iPython notebooks.
After OA process completes a copy of each iPython notebook is going to be copied to the same location of results files. 
With this iPython notebooks user will be able to perform further analysis and score connections. User can also
experiment adding or modifying the code. 
If a new functionality is required for the ipython notebook, the templates need to be modified to include the functionality for new executions.
For further reference on how to work with these notebooks, you can read:
- [Edge Notebook](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/flow/ipynb_templates/EdgeNotebook.md)
- [Threat Investigation Notebook](https://github.com/Open-Network-Insight/oni-oa/blob/1.1/oa/flow/ipynb_templates/ThreatInvestigation.md)