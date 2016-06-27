var React = require('react');

var OniStore = require('../stores/OniStore');

var PanelRow = React.createClass({
  getInitialState: function () {
    var state;

    state = {maximized: false, minimized: false, childrenTitles: []};

    React.Children.forEach(this.props.children, child => {
        state.childrenTitles.push(child.props.title);
    });

    return state;
  },
  componentDidMount: function ()
  {
      OniStore.addPanelExpandListener(this._onChildExpanded);
      OniStore.addPanelRestoreListener(this._onChildRestored);
  },
  render: function () {
    var cssCls = this.state.maximized ? 'oni-maximized' : this.state.minimized ? 'oni-minimized' : '';

    return (
      <div className={'row ' + cssCls}>
        {this.props.children}
      </div>
    );
  },
  componentWillUnmount: function ()
  {
    OniStore.removePanelExpandListener(this._onChildExpanded);
    OniStore.removePanelRestoreListener(this._onChildRestored);
  },
  _onChildExpanded: function (childTitle) {
    if (this.state.childrenTitles.indexOf(childTitle)>=0)
    {
        this.setState({maximized: true});
    }
    else
    {
        this.setState({minimized: true});
    }
  },
  _onChildRestored: function (childTitle) {
    if (this.state.childrenTitles.indexOf(childTitle)>=0)
    {
        this.setState({maximized: false});
    }
    else
    {
        this.setState({minimized: false});
    }
  }
});

module.exports = PanelRow;
