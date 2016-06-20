# **Open Network Insight Ipython/Jupyter Front-End**

The visualization repository contains all the front-end code and files related to the Open Network Insight visuals, such as styles, pages, data files, etc.
Some of the technologies used are:

 - [Jupyter Ipython](http://jupyter.org/)
 - [D3js](http://d3js.org/)
 - [JQuery](https://jquery.com/)
 - [Boostrap](http://getbootstrap.com/)
 - [ReactJS](https://facebook.github.io/react/)

----------


## **Folder Structure**

**ipython** 
This is the ipython notebook server root folder, below are more details about child folders:

 - **css**: Pages style sheets  
 - **dataset**: pages data files 
 - **fonts**: pages fonts (Intel Clear font)
 - **images**: Images assets (Intel Logo/others)
 - **js**: JavaScript libraries (D3js, Jquery) and other utility scripts
 - **master**: Data analysis notebooks
 - **op**: DevOps notebooks
 - **user**: User related notebooks and data, it also keeps data generated for an specific date, which is being used to display the charts in the main pages
 - **vast**: Vast/training data related pages and scripts.

**ipython->vast**
It contains the pages, scripts, notebooks and data files related to the vast/training data. It is basically a copy of the main root folder but with slightly code differences to fit the needs of the training data.

----------

## **Operational Analitycs**
* [DNS](ipython/dns/README.md)
* [FLOW](ipython/flow/README.md)

## **IPython NoteBooks**
* Flow
 * [EdgeNotebook](ipython/flow/EdgeNotebook.md) 
 * [ThreatInvestigation](ipython/flow/ThreatInvestigation.md)
* DNS
 * [EdgeNotebook](ipython/dns/EdgeNotebook.md) 
 * [ThreatInvestigation](ipython/dns/ThreatInvestigation.md)

##**Views**

###Analyst View (index_sconnects.html)
The Analyst view provides a dashboard showing the top 250 suspicious connects. 

###**Ingest Summary (index_ingest.html)**
Interactive histogram dashboard that shows the amount of data captured in a certain period of time.

###**Story Board (storyboard_sconnect.html)**
Executive Briefing dashboard
