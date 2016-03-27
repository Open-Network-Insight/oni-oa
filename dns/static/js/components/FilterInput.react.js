var React = require('react');

var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');
var DnsActions = require('../actions/DnsActions');
var SuspiciousStore = require('../stores/SuspiciousStore');
var OniUtils = require('../OniUtils');

var FilterInput = React.createClass({
  getInitialState: function ()
  {
    return {filter: ''};
  },
  componentDidMount: function ()
  {
    SuspiciousStore.addChangeFilterListener(this._onChangeFilter);
  },
  componentWillUnmount: function ()
  {
    SuspiciousStore.removeChangeFilterListener(this._onChangeFilter);
  },
  render: function ()
  {
    var cssClasses;

    cssClasses = 'form-control form-control-xs';

    if (this.state.filter && !OniUtils.IP_V4_REGEX.test(this.state.filter))
    {
      cssClasses += ' has-error';
    }
    
    return (
      <input type="text" className={cssClasses} placeholder="0.0.0.0" autoFocus={true} onChange={this._onChange} value={this.state.filter} />
    );
  },
  _onChange: function (e)
  {
    // Let everyone know that the value has changed
    DnsActions.setFilter(e.target.value);
  },
  _onChangeFilter: function ()
  {
    // Re-render input
    this.setState({filter: SuspiciousStore.getFilter()});
  }
});

module.exports = FilterInput;