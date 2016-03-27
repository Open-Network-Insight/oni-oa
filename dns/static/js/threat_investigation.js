var React = require('react');

var DnsConstants = require('./constants/DnsConstants');
var OniUtils = require('./OniUtils');

var DateInput = require('./components/DateInput.react');

function reloadNotebook(date)
{
    date = date.replace(/-/g, '');
    $('iframe').attr('src', DnsConstants.THREAT_INVESTIGATION_NOTEBOOK.replace('{date}', date));
}

function onDateChange(e)
{
    var date;

    date = OniUtils.getDateString(e.date);

    reloadNotebook(date);
}

React.render(
  (
    <div className="form-group">
      <label htmlFor="dataDatePicker" className="control-label">Data Date:</label>
      <DateInput id="dataDatePicker" onChange={onDateChange} />
    </div>
  ),
  document.getElementById('nav_form')
);

// Set search criteria
var date;

date = OniUtils.getCurrentDate();

reloadNotebook(date);
