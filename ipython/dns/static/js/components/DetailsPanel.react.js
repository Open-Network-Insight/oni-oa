var React = require('react');

var DnsConstants = require('../constants/DnsConstants');

var DnsAppStore = require('../stores/DnsAppStore');

var DetailsTablePanel = require('./DetailsTablePanel.react');
var DetailsDendrogramPanel = require('./DetailsDendrogramPanel.react');

var DetailsPanel = React.createClass({
  getInitialState: function ()
  {
    return {};
  },
  componentDidMount: function ()
  {
    DnsAppStore.addPanelToggleModeListener(this._onToggleMode);
  },
  componentWillUnmount: function ()
  {
    DnsAppStore.removePanelToggleModeListener(this._onToggleMode);
  },
  render: function ()
  {
    if (this.state.mode === DnsConstants.VISUAL_DETAILS_MODE)
    {
      return (
        <DetailsDendrogramPanel />
      );
    }
    else
    {
      return (
        <DetailsTablePanel />
      );
    }
  },
  _onToggleMode: function (panel, mode)
  {
    if (panel!==this.props.title) return;
    
    this.setState({mode: mode});
  }
});

module.exports = DetailsPanel;