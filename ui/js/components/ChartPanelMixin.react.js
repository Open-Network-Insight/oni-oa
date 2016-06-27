var React = require('react');

var OniActions = require('../../../js/actions/OniActions');
var EdInActions = require('../../../js/actions/EdInActions');
var OniConstants = require('../../../js/constants/OniConstants');
var ChordsDiagramStore = require('../stores/ChordsDiagramStore');

var DetailsChordsPanel = React.createClass({
  getInitialState: function ()
  {
    return {loading: true};
  },
  render:function()
  {
    var content;

    if (this.state.error)
    {
      content = (
        <span className="text-danger">
          {this.state.error}
        </span>
      );
    }
    else if (this.state.loading)
    {
      content = (
        <div className="oni_loader">
            Loading <span className="spinner"></span>
        </div>
      );
    }
    else
    {
      content = '';
    }

    return (
      <div>{content}</div>
    )
  },
  componentDidMount: function()
  {
    window.addEventListener('resize', this.buildGraph);
  },
  componentWillUnmount: function ()
  {
    window.removeEventListener('resize', this.buildGraph);
  },
  componentDidUpdate: function ()
  {
    if (!this.state.loading)
    {
      this.buildGraph();
    }
  },
  buildGraph: draw,
  _onChange: function () {
    this.setState(ChordsDiagramStore.getData());
  }
});

module.exports = DetailsChordsPanel;
