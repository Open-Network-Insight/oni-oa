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
    DnsAppStore.addPanelToggleModeListener(this._toggleMode);
  },
  componentWillUnmount: function ()
  {
    SuspiciousStore.removeChangeDateListener(this._onDateChange);
    DnsAppStore.removePanelToggleModeListener(this._toggleMode);
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
  },
  _toggleMode: function (panel)
  {
    if (panel!==this.props.title) return;
    
    if (!/showNinjaMode/.test(this.getDOMNode().contentWindow.location.hash))
    {
      this.getDOMNode().contentWindow.location.hash = 'showNinjaMode';
    }
    else
    {
      this.getDOMNode().contentWindow.location.hash = 'showEasyMode';
    }
  }
});

module.exports = NotebookPanel;