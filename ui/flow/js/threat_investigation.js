var React = require('react');

var OniActions = require('../../js/actions/OniActions');
var OniConstants = require('../../js/constants/OniConstants');
var OniUtils = require('../../js/utils/OniUtils');

var DateInput = require('../../js/components/DateInput.react');

React.render(
    (
      <form className="form-inline">
        <div className="form-group">
          <label htmlFor="dataDatePicker" className="control-label">Data Date:</label>
          <div className="input-group input-group-xs">
            <DateInput id="dataDatePicker" />
            <div className="input-group-btn">
              <span className="btn btn-default" title="Data date">
                <span className="glyphicon glyphicon-calendar" aria-hidden="true"></span>
              </span>
            </div>
          </div>
        </div>
      </form>
  ),
  document.getElementById('nav_form')
);

var Panel = require('../../js/components/Panel.react');
var IPythonNotebookPanel = require('../../js/components/IPythonNotebookPanel.react');

React.render(
  <Panel title={OniConstants.NOTEBOOK_PANEL} container className="col-md-12">
    <IPythonNotebookPanel date={OniUtils.getCurrentDate()} ipynb="flow/${date}/Threat_Investigation.ipynb" />
  </Panel>,
  document.getElementById('oni-content-wrapper')
);
// Set search criteria
var date;

date = OniUtils.getCurrentDate();

OniActions.setDate(date);
