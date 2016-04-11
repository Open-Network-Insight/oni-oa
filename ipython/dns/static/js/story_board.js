var React = require('react');

var DnsActions = require('./actions/DnsActions');
var StoryBoardActions = require('./actions/StoryBoardActions');
var OniUtils = require('./OniUtils');

var DateInput = require('./components/DateInput.react');

React.render(
  (
    <div className="form-group">
      <label htmlFor="dataDatePicker" className="control-label">Data Date:</label>
      <DateInput id="dataDatePicker" onChange={StoryBoardActions.reloadComments} />
    </div>
  ),
  document.getElementById('nav_form')
);

var Panel = require('./components/Panel.react');

// Render Comments Panel
var ExecutiveThreatBriefingPanel = require('./components/ExecutiveThreatBriefingPanel.react');
React.render(
    <Panel title="Executive Threat Briefing" expandable>
        <ExecutiveThreatBriefingPanel />
    </Panel>,

document.getElementById('executive_threat_briefing')
);

// Render Incident Progression Panel
var IncidentProgressionPanel = require('./components/IncidentProgressionPanel.react');
React.render(
    <Panel title="Incident Progression" expandable>
        <IncidentProgressionPanel />
    </Panel>,
    document.getElementById('incident_progression')
);

// Set search criteria
var date;

date = OniUtils.getCurrentDate();

DnsActions.setDate(date);

// Make inital load
StoryBoardActions.reloadComments();
