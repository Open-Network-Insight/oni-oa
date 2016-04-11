var React = require('react');
var assign = require('object-assign');

var DnsActions = require('../actions/DnsActions');
var DnsConstants = require('../constants/DnsConstants');
var DnsAppStore = require('../stores/DnsAppStore');

var RELOAD_EVENT = 'reload';

var Panel = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    reloadable: React.PropTypes.bool,
    onReload: React.PropTypes.func,
    expandable: React.PropTypes.bool,
    toggleable: React.PropTypes.bool
  },
  getInitialState: function ()
  {
    return {hidden: false, maximized: false, baseMode: true};
  },
  componentDidMount: function ()
  {
    if (this.props.expandable)
    {
      DnsAppStore.addPanelExpandListener(this._onExpand);
      DnsAppStore.addPanelRestoreListener(this._onRestore);
    }
    
    if (this.props.toggleable)
    {
      DnsAppStore.addPanelToggleModeListener(this._onToggleMode);
    }
  },
  componentWillUnmount: function ()
  {
    if (this.props.expandable)
    {
      DnsAppStore.removePanelExpandListener(this._onExpand);
      DnsAppStore.removePanelRestoreListener(this._onRestore);
    }
    
    if (this.props.toggleable)
    {
      DnsAppStore.removePanelToggleModeListener(this._onToggleMode);
    }
  },
  render: function ()
  {
    var reloadButton, toggleButton, modeButton, childrenWithProps;
    
    if (this.props.reloadable)
    {
      reloadButton = (
        <button type="button" className="btn btn-default btn-xs pull-right" onClick={this.props.onReload}>
          <span className="glyphicon glyphicon-refresh" aria-hidden="true"></span>
        </button>
      );
    }
    
    if (this.props.expandable)
    {
      if (this.state.maximized)
      {
        toggleButton = (
          <button className="btn btn-default btn-xs pull-right margin-side5" onClick={this._onToggleClick}>
            <span className="glyphicon glyphicon-resize-small" aria-hidden="true"></span>
          </button>
        );
      }
      else
      {
        toggleButton = (
          <button className="btn btn-default btn-xs pull-right margin-sides5" onClick={this._onToggleClick}>
            <span className="glyphicon glyphicon-resize-full" aria-hidden="true"></span>
          </button>
        );
      }
    }
    
    if (this.props.toggleable)
    {
      if (this.state.baseMode)
      {
        modeButton = (
          <button type="button" className="btn btn-default btn-xs pull-right" onClick={this._onToggleModeClick}>
            <span className="glyphicon glyphicon-education" aria-hidden="true"></span>
          </button>
        );
      }
      else
      {
        modeButton = (
          <button type="button" className="btn btn-default btn-xs pull-right" onClick={this._onToggleModeClick}>
            <span className="glyphicon glyphicon-user" aria-hidden="true"></span>
          </button>
        );
      }
    }
    
    childrenWithProps = React.Children.map(this.props.children, function (child) {
        return React.cloneElement(child, assign({}, {title: this.props.title}, child.props));
    }, this);
    
    return (
      <div className={(this.state.maximized ? 'col-lg-12' : 'col-lg-6') + ' oni-panel' + (this.state.maximized ? ' maximized' : '') + ' padding2' + (this.state.hidden ? ' hidden' : '')}>
        <div className="panel panel-primary">
          <div className="panel-heading">
            <span className="panel-title">
              <span>{this.props.title}</span>
              {toggleButton}
              {reloadButton}
              {modeButton}
            </span>
          </div>
          <div className="panel-body padding0">
            {childrenWithProps}
          </div>
        </div>
      </div>
    );
  },
  _onToggleClick: function ()
  {
    if (this.state.maximized)
    {
      DnsActions.restorePanel(this.props.title);
    }
    else
    {
      DnsActions.expandPanel(this.props.title);
    }
  },
  _onExpand: function (panel)
  {
    if (this.props.title===panel)
    {
      this.setState({
        hidden: false,
        maximized: true
      });
    }
    else
    {
      $(this.getDOMNode()).hide();
    }
  },
  _onRestore: function (panel)
  {
    if (this.props.title===panel)
    {
      this.setState({
        hidden: false,
        maximized: false
      });
    }
    else
    {
      $(this.getDOMNode()).show();
    }
    
  },
  _onToggleModeClick: function ()
  {
    DnsActions.toggleMode(this.props.title);
  },
  _onToggleMode: function (panel)
  {
    if (panel!==this.props.title) return;
    
    this.setState({
      baseMode: !this.state.baseMode
    });
  }
});

module.exports = Panel;
