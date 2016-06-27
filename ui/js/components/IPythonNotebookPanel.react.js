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
    return {date: this.props.date.replace(/-/g, '')};
  },
  componentDidMount: function ()
  {
    OniStore.addChangeDateListener(this._onDateChange);
  },
  componentWillUnmount: function ()
  {
    OniStore.removeChangeDateListener(this._onDateChange);
  },
  render: function ()
  {
    var ipynbPath;

    ipynbPath = this.props.ipynb.replace('${date}', this.state.date);

    return (
      <iframe
            name="nbView"
            className="nbView"
            src={OniConstants.NOTEBOOKS_PATH + '/' + ipynbPath}>
      </iframe>
    );
  },
  _onDateChange: function ()
  {
    var date = OniStore.getDate().replace(/-/g, '');

    this.setState({date: date});
  }
});

module.exports = NotebookPanel;
