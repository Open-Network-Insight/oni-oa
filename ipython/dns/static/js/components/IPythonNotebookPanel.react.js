var React = require('react');

var SuspiciousStore = require('../stores/SuspiciousStore');
var DnsAppStore = require('../stores/DnsAppStore');

var NotebookPanel = React.createClass({
  getInitialState: function ()
  {
    return {date: this.props.date.replace(/-/g, '')};
  },
  componentDidMount: function ()
  {
    SuspiciousStore.addChangeDateListener(this._onDateChange);
  },
  componentWillUnmount: function ()
  {
    SuspiciousStore.removeChangeDateListener(this._onDateChange);
  },
  render: function ()
  {
    return (
      <iframe
            name="nbView"
            className="nbView"
            src={'../../notebooks/dns/user/' + this.state.date + '/Edge_Investigation.ipynb'}>
      </iframe>
    );
  },
  _onDateChange: function ()
  {
    var date = SuspiciousStore.getDate().replace(/-/g, '');
    
    this.setState({date: date});
  }
});

module.exports = NotebookPanel;