# Open Network Insight - Operational Analytics User Interface

Provides tools for interactive visualization, noise filters, white listing, and attack heuristics.

## Table of Content

- [Open Network Insight - Operational Analytics User Interface](#open-network-insight---operational-analytics-user-interface)
  * [Table of Content](#table-of-content)
  * [Intended Audience](#intended-audience)
  * [Getting Started](#getting-started)
  * [Technical Documentation](#technical-documentation)
    + [Flows: Inline JavaScript](#flows-inline-javascript)
      - [Dashboard](#dashboard)
        * [Suspicious Connects](#suspicious-connects)
        * [Network View](#network-view)
        * [Edge Investigation](#edge-investigation)
        * [Details View](#details-view)
      - [Threat Investigation](#threat-investigation)
      - [Storyboard](#storyboard)
        * [Executive Threat Briefing](#executive-threat-briefing)
        * [Incident Progression](#incident-progression)
        * [Impact Analysis](#impact-analysis)
        * [Map View | Globe](#map-view--globe)
        * [Timeline](#timeline)
      - [Injest Summary](#injest-summary)
    + [DNS: ReactJS + Flux](#dns-reactjs--flux)

## Intended Audience

This document is intended for front end developers who want to contribute to our user inteface. To get the most benefit from this guidance, you should have an understanding of the following technologies:

- HTML
- CSS
- JavaScript
	- D3 library

## Getting Started

Here you will find useful information to get you started on contributing to our User Interface (UI). For more information on how to run and use "Open Network Insight Operational Analytics User Interface" (ONI OA UI) please go to our [User Guide](https://github.com/Open-Network-Insight/open-network-insight/wiki/User%20Guide)

## Technical Documentation

There are two architectural approaches when it comes to the UI:

1. [Flows: Inline JavaScript](#flows-inline-javascript)
2. [DNS: ReactJS + Flux](#dns-reactjs--flux)

### Flows: Inline JavaScript
Back in the days, when ONI was on its early days, flows followed a traditional approach to build its UI, inline JavaScript :( . This will change on next release, but for now, just keep in mind that every JavaScript code is right in between lines of each HTML file.

Flows has the following sections:

1. [Dashboard](#dashboard)
2. [Threat Investigation](ThreatInvestigation.md)
3. [Storyboard](#storyboard)
4. [Ingest Summary](#ingest-summary)

#### Dashboard
*ONI/ipython/index\_sconnects.html*

UI Events handled:

- Date change event
- Filter change event
- Data reload event
- Frame Expand/Restore events

It defines the navigation bar and includes 4 frames and an iframe for each frame:

1. [Suspicious Connects](#suspicious-connects)
2. [Network View](#network-view)
3. [Edge Investigation](EdgeInvestigation.md)
4. [Details View](#details-view)

 
##### Suspicious Connects
*ONI/ipython/sconnects\_scores.html*

Data source:

- *ONI/ipython/user/_{DATE}_/flow_scores.csv*

UI Events:

- Mouse enter row event
- Mouse leaves row event
- Row selected event

##### Network View
_ONI/ipython/sconnects_newtflow.html_

Data source:

- *ONI/ipython/user/_{DATE}_/flow_scores.csv*

UI Events:

- Mouse over node event
- Mouse move over node event
- Mouse moves out node event
- Primary click on a node event
- Secondary click on a node event

##### Edge Investigation
*ONI/ipython/master/Edge\_Investigation\_master.ipynb*

For more information about this IPython Notebook click [here](EdgeInvestigation.md)

##### Details View
*ONI/ipython/sconnects\_details.html*

_Table view_
Data source:

- *ONI/ipython/user/{_DATE_}/edge-{_SRC\_IP_}-{_DST\_IP_}-{_T\_START\_HH_}-{_T\_START\_MM_}.tsv*

_Chord Diagram View_
Data source:

- *ONI/ipython/user/{_DATE_}/chord-{_IP_}.tsv*

UI Events

- Chart drag event
- Mouse over group event
- Mouse leaves group event

#### Threat Investigation
*ONI/ipython/master/Threat\_Investigation\_master.ipynb*

For more information about this IPython Notebook click [here](ThreatInvestigation.md)

#### Storyboard
*ONI/ipython/storyboard\_sconnect.html*

UI Events handled:

- Date change event
- Data reload event
- Frame Expand/Restore events

It defines the navigation bar and includes 5 frames and an iframe for each frame:

- [Executive Threat Briefing](#executive-threat-briefing)
- [Incident Progression](#incident-progression)
- [Impact Analysis](#impact-analysis)
- [Map View | Globe](#map-view-globe)
- [Timeline](#timeline)

##### Executive Threat Briefing

*ONI/ipython/dashnav.html*

Data source:

*ONI/ipython/user/{DATE}/threats.csv*

UI Events:

- Primary mouse click on comment event

##### Incident Progression

*ONI/ipython/dendro.html*

Data source:

*ONI/ipython/user/{DATE}/dendro-{IP}.json*

UI Events:

- Window resize event

##### Impact Analysis

*ONI/ipython/bars.html*

Data source:

*ONI/ipython/user/{DATE}/stats-{IP}.json*

UI Events:

- Window resize event
- Primary mouse click on background
- Primary mouse click on bar

##### Map View | Globe

*ONI/ipython/globe.html*

Data source:

*ONI/ipython/user/{DATE}/globe_{IP}.json*

UI Events:

- Mouse move event
- Mouse up event
- Mouse down event

##### Timeline

*ONI/ipython/timeline.html*

Data source:

*ONI/ipython/user/{DATE}/sbdet-{IP}.tsv*

UI Events:

- Window resize event
- Primary mouse click event
- D3's Zoom event

#### Injest Summary

*ONI/ipython/index\_ingest.html*

Data source:

*ONI/ipython/user/ingest_summary/\**

UI Events:

- Start date change event
- End date change event
- D3's Zoom event

### DNS: ReactJS + Flux

For more information please go [here](dns/UI.md#dns-reactjs--flux)
