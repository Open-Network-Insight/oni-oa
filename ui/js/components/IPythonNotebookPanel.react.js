var React = require('react');

var OniConstants = require('../constants/OniConstants');
var OniStore = require('../stores/OniStore');

var NotebookPanel = React.createClass({
  propTypes: {
    date: React.PropTypes.string.isRequired,
    ipynb: React.PropTypes.string.isRequired
  },
  getInitialState: function ()
  {
    return {date: this.props.date.replace(/-/g, ''), easyMode:false};
  },
  componentDidMount: function ()
  {
    OniStore.addChangeDateListener(this._onDateChange);
    OniStore.addPanelToggleModeListener(this._onToggleMode);
  },
  componentWillUnmount: function ()
  {
    OniStore.removeChangeDateListener(this._onDateChange);
    OniStore.removePanelToggleModeListener(this._onToggleMode);
  },
  render: function ()
  {
    var ipynbPath;

    ipynbPath = this.props.ipynb.replace('${date}', this.state.date);

    return (
      <iframe
            name="nbView"
            className="nbView"
            src={OniConstants.NOTEBOOKS_PATH + '/' + ipynbPath + (this.state.easyMode ? '#showEasyMode': '#showNinjaMode') }>
      </iframe>
    );
  },
  _onDateChange: function ()
  {
    var date = OniStore.getDate().replace(/-/g, '');

    this.setState({date: date});
  },
  _onToggleMode:function(){
    this.setState({easyMode:!this.state.easyMode});
  }
});

module.exports = NotebookPanel;
