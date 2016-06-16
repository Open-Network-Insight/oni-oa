# Open Network Insight - Operational Analytics User Interface

Provides tools for interactive visualization, noise filters, white listing, and attack heuristics.

## Table of Content

- [Open Network Insight - Operational Analytics User Interface](#open-network-insight---operational-analytics-user-interface)
  * [Table of Content](#table-of-content)
  * [Intended Audience](#intended-audience)
  * [Getting Started](#getting-started)
  * [Technical Documentation](#technical-documentation)
    + [Flows: Inline JavaScript](#flows-inline-javascript)
    + [DNS: ReactJS + Flux](#dns-reactjs--flux)
      - [Dashboard](#dashboard)
      - [Threat Investigation](#threat-investigation)
      - [Storyboard](#storyboard)
      - [Pipeline structure](#pipeline-structure)
        * [Actions](#actions)
          + [DnsActions.js](#dnsactionsjs)
          + [StoryBoardActions.js](#storyboardactionsjs)
        * [Components](#components)
          + [DateInput.react.js](#dateinputreactjs)
          + [DendrogramMixin.react.js](#dendrogrammixinreactjs)
          + [DetailsDendrogramPanel.react.js](#detailsdendrogrampanelreactjs)
          + [DetailsPanel.react.js](#detailspanelreactjs)
          + [DetailsTablePanel.react.js](#detailstablepanelreactjs)
          + [ExecutiveThreatBriefingPanel.react.js](#executivethreatbriefingpanelreactjs)
          + [FilterInput.react.js](#filterinputreactjs)
          + [GridPanelMixin.react.js](#gridpanelmixinreactjs)
          + [IncidentProgressionPanel.react.js](#incidentprogressionpanelreactjs)
          + [IPythonNotebookPanel.react.js](#ipythonnotebookpanelreactjs)
          + [NetworkPanel.react.js](#networkpanelreactjs)
          + [Panel.react.js](#panelreactjs)
          + [SuspiciousPanel.react.js](#suspiciouspanelreactjs)
        * [Constants](#constants)
          + [DnsConstants.js](#dnsconstantsjs)
        * [Dispatchers](#dispatchers)
          + [DnsDispatcher.js](#dnsdispatcherjs)
        * [Stores](#stores)
          + [CommentsStore.js](#commentsstorejs)
          + [DendrogramStore.js](#dendrogramstorejs)
          + [DetailsStore.js](#detailsstorejs)
          + [DnsAppStore.js](#dnsappstorejs)
          + [IncidentProgressionStore.js](#incidentprogressionstorejs)
          + [RestStore.js](#reststorejs)
          + [SuspiciousStore.js](#suspiciousstorejs)
      - [Dev Requirements](#dev-requirements)
      - [Development/Debugging process](#developmentdebugging-process)
      - [Building modules](#building-modules)

## Intended Audience

This document is intended for front end developers who want to contribute to our user inteface. To get the most benefit from this guidance, you should have an understanding of the following technologies:

- HTML
- CSS
- JavaScript
	- D3 library
	- ReactJS+Flux arquitecture
	- NPM package manager

## Getting Started

Here you will find useful information to get you started on contributing to our User Interface (UI). For more information on how to run and use "Open Network Insight Operational Analytics User Interface" (ONI OA UI) please go to our [User Guide](https://github.com/Open-Network-Insight/open-network-insight/wiki/User%20Guide)

## Technical Documentation

There are two architectural approaches when it comes to the UI:

1. [Flows: Inline JavaScript](#flows-inline-javascript)
2. [DNS: ReactJS + Flux](#dns-reactjs--flux)

### Flows: Inline JavaScript

For more information please go [here](../UI.md#flows-inline-javascript)

### DNS: ReactJS + Flux

The main issue with flows is that is hard to maintain. This pipeline introduces a new arquitecture that allows for modular code that is also scalable and easy to maintain.

We have chosen ReactJS to build our UI and on top of that we are following the Flux arquitecture as a complement. This allows contributors to get on board quickly as they will find lots of information on the internet.

For more information about ReactJS and Flux, please go to:

- https://facebook.github.io/react/
- https://facebook.github.io/flux/

From now on we assume you are familiar with ReactJS+Flux applications.

DNS has the following sections:

1. [Dashboard](#dashboard)
2. [Threat Investigation](#threat-investigation)
3. [Storyboard](#storyboard)

#### Dashboard
- *ONI/dns/index\_sdns.html*
- *ONI/dns/static/js/suspicious.js*

#### Threat Investigation
- *ONI/dns/threat\_investigation.html*
- *ONI/dns/js/threat\_investigation.js*

More information [here](#threat-investigation)

#### Storyboard
- *ONI/dns/story\_board.html*
- *ONI/dns/js/story\_board.js*

#### Pipeline structure

Our code follows the recomendation for ReactJS+Flux applications, the project structure looks like this:

- *ONI/dns/static/js/*
  - [_actions_](#actions)
  - [_components_](#components)
  - [_constants_](#constants)
  - [_dispatchers_](#dispatchers)
  - [_stores_](#stores)

##### Actions

###### DnsActions.js

Defines pipeline level actions as well as actions that belong to dashboard section.

_Global actions_

>- UPDATE_DATE
>
>	Broadcasts the new selected date
>	
>- EXPAND_PANEL
>
>	Request a "panel" to toggle to "expand" mode 
>	
>- RESTORE_PANEL
>
>	Request expanded "panel" to toggle to "restore" mode
>
>- TOGGLE_MODE_PANEL
>
>	Request a "panel" to toggle to switch to a new "mode"

_Dashboard actions_
>- UPDATE_FILTER
>
>	Broadcasts the new filter being applied
>
>- RELOAD_SUSPICIOUS
>
>	Request to reload suspicious data
>
>- RELOAD_DETAILS
>
>	Request to reload details data
>
>- RELOAD_DETAILS_VISUAL
>
>	Request to reload visual details data
>
>- HIGHLIGHT_THREAT
>
>	Request to hightlight a threat
>
>- UNHIGHLIGHT_THREAT
>
>	Request to stop highlighting a threat
>
>- SELECT_THREAT
>
>	Broadcasts the threat being selected
>
>- SELECT_SRC_IP
>
>	Broadcasts the source ip being selected

###### StoryBoardActions.js

Defines actions that belong to storyboard sections

>- RELOAD_COMMENTS
>
>	Request to reload comments data
>
>- SELECT_COMMENT
>
>	Broadcasts the comment being selected

##### Components

###### DateInput.react.js

A pipiline level component that allows user to  select a date. After selecting the date this component will start an `UPDATE_DATE` action from [DnsActions](#dnsactions-js).

###### DendrogramMixin.react.js

This mixin takes care of the creation of dendrogram charts, more specific components should be created in order to gather data to feed this mixing.

While executing render function, this component will look for `this.state.root` which should be an object like:
```javascript
{
  name: 'Node Label',
  children: [
              ...
  ]
}
```
Each node element in the "_children_" list has the same structure.

> __Note__:
> _"children"_ property could be empty or ommited.

###### DetailsDendrogramPanel.react.js

Extends [DendrogramMixim](#dendrogrammixin-react-js) and listens for changes on [DendrogramStore](#dendrogramstore-js) in order to create the root node required by mixin.

###### DetailsPanel.react.js

Listen for change mode events on [DnsAppStore](#DnsAppStore.js) and switches its content between [DetailsTablePanel](#detailstablepanel-react-js) and [DetailsDendrogramPanel](#detailsdendrogrampanel-react-js).

###### DetailsTablePanel.react.js

Extends [GridPanelMixin](#gridpanelmixin-react-js) and renders a table holding detail data for the selected threat. Listens for change event on [DetailsStore](#DetailsStore.js) in order to create data required by mixin.

###### ExecutiveThreatBriefingPanel.react.js

Renders a list of available comments added on the threat investigation section. As soons as user selects a comment it will start a `SELECT_COMMENT` action from  [StoryBoardActions](#storyboardactions-js) and will also show the summary for selected comment. Listen for change events from [CommentsStore](#CommentsStore.js).

###### FilterInput.react.js

A component that allows user to filter suspicious data. As soon as the filter changes, this component will start an `UPDATE_FILTER` action from [DnsActions](#dnsactions-js).

###### GridPanelMixin.react.js

A helper component which renders a table. It allows for customization on final components.

While executing render function, this components looks for:

> - `this.state.data`
>
>	An array of object to be rendered as rows in the table body.
>
> - `this.state.error`
>
>	A custom error meessage to display.
>
> - `this.state.headers`
>
>	An onbject holding human readable labels for table headers.
>
> - `this.state.loading`
>
>	When true, mixin will display a loading indicator.
>
> - `this.state.selectedRows`
> 
>	A list of data elements that should have extra CSS class to show a selected state.

A custom render function can be defined for individual cells. A render function must follow this naming convention:

```javascript
...
_render_{CELL_NAME}_cell : function () {
	...
}
...
```

If no custom cell render is porvided, a default function will be used to render the cell value as plain text.

Each table row support the following events:

> - onClick
> 
>	Subscribe to this element by adding a `_onClickRow` function to the final component. 
> 
> - onMouseEnter
> 
>	Subscribe to this element by adding a `_onMouseEnterRow` function to the final component.
> 
> - onMouseLeave
>
>	Subscribe to this element by adding a `_onMouseLeaveRow` function to the final component.

###### IncidentProgressionPanel.react.js

Uses [DendrogramMixin](#DendrogramMixin.react.js) in order to create a graphic representation of a comment.

This component listen for changes on [IncidentProgressionStore](#IncidentProgressionStore.js) in order to create the root node required by mixin.

###### IPythonNotebookPanel.react.js

Helper component that makes it easy to render an [Edge Investigation IPython Notebook](#edge-investigation).

It listen for date changes on [SuspiciousStore](#SuspicousStore.js) and uses that date to build the PATH to the ipython notebook file.

###### NetworkPanel.react.js

Crates a visual representation of Suspicious data.

Listens for [SuspicuiousStore](#SuspiciousStore.js) events:

> - _data change_
> 
>	Will refresh canvas.
> 
> - _threat hightlight_
> 
> 	Blur other nodes to focus user attention on a node.
> 
> - _threat unhighlight_
> 
> 	Remove blur effect.
> 
> - _threat select_
> 
>	Will make threat node start blinking.

Uses _ONI/ipython/dns/static/domainList.csv_ as a definition source for top level domains.

 _Node events_:
 
> - _primary mouse click_
> 
> Node's IP will be broadcasted and as a result [DetailsPanel](#DetailsPanel.react.js) will switch to Visual mode.
> 
> - _secondary mouse click_
> 
> Node's IP will be used to start an `UPDATE_FILTER` action. [SuspiciousPanel](#SuspiciousPanel.react.js) as well as [NetworkPanel](#NetworkPanel.react.js) will refresh.

###### Panel.react.js

A component to wrap content and deal with general panel events.

__Properties:__

- title: Panel's title.
- reloadable: `true` when panel can be reloaded, `false` otherwise.
- onReload: Callback to execute when user clicks the reload button.
- expandable: `true` when panel can be expanded/restored, `false` otherwise.
- toggleable: `true` when panel can toggle between modes, `false` otherwise.

Listen for [DnsAppStore](#DnsAppStore.js) events:

> - expand
> 
>	Makes panel expand and take over available space on screen by hidding extra panels.
> 
> - restore
> 
>	Restores panel and makes every panel visible.
> 
> - toggle
> 
>	Make panel toggle switch to a new mode.

###### SuspiciousPanel.react.js

Renders a table holding a list of suspicious DNS data.

Listens for [SuspiciousStore](#SuspiciousStore.js) events:

> - change
> 
>	Makes this panel re-render suspicious data.

Extends [GridPanelMixin](#GridPanelMixin.react.js) and provides event handlers for:

> - onMouseClick
> 
>	Uses [DnsActions](#DnsActions.js). Starts `SELECT_THREAT` action, loads threat details by starting `RELOAD_DETAILS` action and finally tell [DetailsPanel](#DetailsPanel.react.js) to switch into table mode by starting `TOGGLE_MODE_PANEL` action.
>	
> - onMouseEnter
> 
>	Starts `HIGHLIGHT_THREAT` on [DnsActions](#DnsActions.js).
> 
> - onMouseLeave
> 
>	Starts `UNHIGHLIGHT_THREAT` on [DnsActions](#DnsActions.js).

##### Constants

###### DnsConstants.js

Defines constant values for action names, panel identifiers, panel modes, notebook source path and paths to data source files.

##### Dispatchers

###### DnsDispatcher.js

As part of the Flux arquitecture, ONI defines its own action dispatcher.

##### Stores

###### CommentsStore.js

This store extends [RestStore](#RestStore.js) and listens for comment related actions. 

- Actions
  > - UPDATE_DATE
  > 
  >		Stores new date internally for future server requests.
  >	
  > - RELOAD_COMMENTS
  > 
  >		Requests comments data from server.

- Data source
	> (Pipe separated) __ONI/ipython/dns/user/{DATE}/threats.csv_

###### DendrogramStore.js

This store extends [RestStore](#RestStore.js) and listens for threat details related actions.

- Actions
    > - UPDATE_DATE  
    > 
    > 	Stores new date internally for future server requests.
    > 
    > - SELECT_SRC_IP
    > 
    > 	Stores source ip for future server requests.
    > 
    > - RELOAD_SUSPICIOUS
    > 
    > 	Resetsdendrogram data when suspicious data is reloaded.
    > 
    > - RELOAD_DETAILS_VISUAL
    > 
    > 	Requests threat's visual details data from server.

- Data source
	> (Comma separated) __ONI/ipython/dns/user/{DATE}/dendro-{SRC_IP}.csv_

###### DetailsStore.js

This store extends [RestStore](#RestStore.js) and listens for threat details related actions.

- Actions
	> - UPDATE_DATE
	> 
	> 	Stores new date internally for future server requests.
	> 
	> - SELECT_THREAT
	> 
	> 	Stores seelected threat for future server requests.
	> 
	> - RELOAD_SUSPICIOUS
	> 
	> 	Resets details data when suspicious data is reloaded.
	> 
	> - RELOAD_VISUAL
	> 
	> 	Request threat's details data from server.

- Data source
	> (Comma separated) *\_ONI/ipython/dns/user/{DATE}/edge-{DNS\_QUERY\_NAME}\_{TIME}.csv*

###### DnsAppStore.js

Stores frame related data

- Actions
	> - EXPAND_PANEL
	> 
	> 	Emits an event to expand a frame.
	> 
  	> - RESTORE_PANEL
  	> 
  	> 	Emits an event to restore a frame.
  	> 
  	> - TOGGLE_MODE_PANEL
  	> 
  	> 	Emits an event to toogle a frame to a new mode.

- Data source
	> N/A

###### IncidentProgressionStore.js

This store extends [RestStore](#RestStore.js) and listens for comment related actions.

- Actions
	> - UPDATE_DATE
	> 
  	> 	Stores new date internally for future server requests.
  	> 
  	> - SELECT_COMMENT
  	> 
  	> 	Stores selected comment and request comment details from server.

- Data source
	> (Comma separated) *_ONI/ipython/dns/user/{DATE}/threat-dendro-{ID}.csv*

###### RestStore.js

This is a base mixin for all the stores that need to retrieve data from server. It allows to set filters which are sent to the server as JSON object properties in the request body.

Provides methods to listen for data changes. As soon as data comes from the server a change event is triggered.

The internal state for a store can be retrieved by calling the getData method and it looks like:

```javascript
{
  loading: false,
  headers: {
    header1: "Label for header 1",
    ...
    headerN: "Label for header N"
  },
  data: [
    {
      header1: "Value for header1",
      ...,
      headerN: "Value for headerN"
    }
  ],
  error: undefined
}
```

When `loading` is true, store is waiting for the server's response. If any error is send by remote server, the store will look for that error code in its `errorMessages` object and a friendly message will be stored in `error`.

By default this mixin works with comma separated files (CSV), however a special property called `_parser` is available to set a custom parser. A parser must pass the d3's csv parser duck test.

###### SuspiciousStore.js

This store extends [RestStore](#RestStore.js) and listens for suspicious related actions.

- Actions
	> - UPDATE_DATE
	> 
  	> 	Stores new date internally for future server requests.
  	> 
  	> - UDPATE_FILTER
  	> 
  	> 	Stores the filter internally for future server requests.
  	> 
  	> - RELOAD_SUSPICIOUS
  	> 
  	> 	Requests suspicious data from server
  	> 
  	> - HIGHLIGHT_THREAT
  	> 
  	> 	Listens for highlight threat events and stores the threat.
  	> 
  	> - UNHIGHLIGHT_THREAT
  	> 
  	> 	Listens for unhighlight threat events and clears the previous threat.
  	> 
  	> - SELECT_THREAT
  	> 
  	> 	Listens for select threat evetns and keeps record of the selected threat.

#### Dev Requirements

- NPM - Node Package Manager

#### Development/Debugging process

1. Install npm dependencies
	1. $ cd *ONI/ipython/dns/static/*
	2. \# npm install -g watchify
	3. \# npm install -g browserify
	4. \# npm install -g uglify
	5. $ npm install
2. Start ipython server
	1. $ cd ONI/ipython/
	2. $ ./runIpython.sh
3. Start watching for code changes
	1. $ cd ONI/ipython/dns/static/
	2. Watch one of the following modules
  		1. $ npm run watch-suspicious
  		2. $ npm run watch-threat_investigation
  		3. $ npm run watch-story_board
4. Start making code changes, if there is any

#### Building modules

At ONI/ipython/dns/static/ you can:

- Build all modules: `npm run build-all`
- Build suspicious module: `npm run build-suspicious`
- Build threat investigation module: `npm run build-threat_investigation`
- Build storyboard module: `npm run build-story_board`

The build process will create the following files:

- ONI/ipython/dns/static/js/suspicious.bundle.min.js
- ONI/ipython/dns/static/js/threat_investigation.bundle.min.js
- ONI/ipython/dns/static/js/story_board.bundle.min.js
