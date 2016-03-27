var React = require('react');

var DnsConstants = require('./constants/DnsConstants');
var DnsActions = require('./actions/DnsActions');
var OniUtils = require('./OniUtils');

// Build and Render Toolbar
var FilterInput = require('./components/FilterInput.react');
var DateInput = require('./components/DateInput.react');

function resetFilterAndReload()
{
  DnsActions.setFilter('');
  DnsActions.reloadSuspicious();
};

React.render(
  (
    <div className="form-group">
      <label htmlFor="ip_filter" className="control-label">IP/Dns:</label>

      <div className="input-group">
        <span className="input-group-btn">
          <button className="btn btn-primary btn-xs tip" type="button" id="btn_searchIp" title="Enter an IP Address or Domain and click the search button to filter the results." onClick={DnsActions.reloadSuspicious}>
            <i className="fa fa-search"></i>
          </button>
        </span>
        <FilterInput />
      </div>
      <button className=" btn btn-default btn-xs tip" title="Reset filter" id="reset_ip_filter" onClick={resetFilterAndReload}>
        <i className="fa fa-undo"></i>
      </button>
      <label htmlFor="dataDatePicker" className="control-label">Data Date:</label>
      <DateInput id="dataDatePicker" onChange={resetFilterAndReload} />
    </div>
  ),
  document.getElementById('nav_form')
);

// Build and Render Suspicous DNS panel
var Panel = require('./components/Panel.react');

var SuspiciousPanel = require('./components/SuspiciousPanel.react');
React.render(
  <Panel title="Suspicious" expandable reloadable onReload={DnsActions.reloadSuspicious}>
    <div className="col-lg-12">
      <div id="trainingtext" className="training">
        <p className="small">
          DNS Suspicious connections are listed below in ranked order.  Mouse over a
          connection to highlight it in the connection graph on the right.  Click the connection to generate all the log details in the detail
          view.
        </p>
      </div>
    </div>
    <SuspiciousPanel />
  </Panel>,
  document.getElementById('lda_scores')
);

var IPythonNotebookPanel = require('./components/IPythonNotebookPanel.react');
React.render(
  <Panel title="Notebook" expandable toggleable>
     <IPythonNotebookPanel date={OniUtils.getCurrentDate()} />
  </Panel>,
  document.getElementById('notebook')
);

var NetworkPanel = require('./components/NetworkPanel.react');
React.render(
  <Panel title="Network View" expandable reloadable onReload={DnsActions.reloadSuspicious}>
    <NetworkPanel />
  </Panel>,
  document.getElementById('netflow_diagram')
);

var DetailsPanel = require('./components/DetailsPanel.react');
React.render(
  <Panel title={DnsConstants.DETAILS_PANEL} expandable>
    <DetailsPanel />
  </Panel>,
  document.getElementById('details')
);

var initial_filter = OniUtils.getCurrentFilter();

// Set search criteria
DnsActions.setDate(OniUtils.getCurrentDate());
initial_filter && DnsActions.setFilter(initial_filter);

// Load data
DnsActions.reloadSuspicious();

// Create a hook to allow notebook iframe to reloadSuspicious
window.iframeReloadHook = DnsActions.reloadSuspicious;
