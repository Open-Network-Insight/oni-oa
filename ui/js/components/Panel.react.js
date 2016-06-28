var React = require('react');
var assign = require('object-assign');

var OniActions = require('../actions/OniActions');
var OniStore = require('../stores/OniStore');

var Panel = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    container: React.PropTypes.bool,
    className: React.PropTypes.string,
    reloadable: React.PropTypes.bool,
    onReload: React.PropTypes.func,
    expandable: React.PropTypes.bool,
    toggleable: React.PropTypes.bool
  },
  getDefaultProps: function () {
    return {
      className: 'col-md-6'
    }
  },
  getInitialState: function ()
  {
    return {hidden: false, maximized: false, baseMode: true};
  },
  componentDidMount: function ()
  {
    if (this.props.expandable)
    {
      OniStore.addPanelExpandListener(this._onExpand);
      OniStore.addPanelRestoreListener(this._onRestore);
    }

    if (this.props.toggleable)
    {
      OniStore.addPanelToggleModeListener(this._onToggleMode);
    }
  },
  componentWillUnmount: function ()
  {
    if (this.props.expandable)
    {
      OniStore.removePanelExpandListener(this._onExpand);
      OniStore.removePanelRestoreListener(this._onRestore);
    }

    if (this.props.toggleable)
    {
      OniStore.removePanelToggleModeListener(this._onToggleMode);
    }
  },
  render: function ()
  {
    var reloadButton, resizeButton, toggleButton, cssCls, containerCss;

    if (this.props.reloadable)
    {
      reloadButton = (
        <li className="refresh">
          <button type="button" className="btn btn-default btn-xs pull-right" onClick={this.props.onReload}>
            <span className="glyphicon glyphicon-refresh" aria-hidden="true"></span>
          </button>
        </li>
      );
    }

    if (this.props.expandable)
    {
      if (this.state.maximized)
      {
        resizeButton = (
          <li className="resize-small hidden-xs hidden-sm">
            <button className="btn btn-default btn-xs pull-right margin-side5" onClick={this._onToggleClick}>
              <span className="glyphicon glyphicon-resize-small" aria-hidden="true"></span>
            </button>
          </li>
        );
      }
      else
      {
        resizeButton = (
          <li className="fullscreen hidden-xs hidden-sm">
            <button className="btn btn-default btn-xs pull-right margin-sides5" onClick={this._onToggleClick}>
              <span className="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>
            </button>
          </li>
        );
      }
    }

    if (this.props.toggleable)
    {
      if (this.state.baseMode)
      {
        toggleButton = (
          <button type="button" className="btn btn-default btn-xs pull-right" onClick={this._onToggleModeClick}>
            <span className="glyphicon glyphicon-education" aria-hidden="true"></span>
          </button>
        );
      }
      else
      {
        toggleButton = (
          <button type="button" className="btn btn-default btn-xs pull-right" onClick={this._onToggleModeClick}>
            <span className="glyphicon glyphicon-user" aria-hidden="true"></span>
          </button>
        );
      }
    }

    cssCls = this.state.maximized ? 'col-md-12' : this.state.minimized ? 'oni-minimized' : this.props.className;
    containerCss = 'panel-body-container' + (this.props.container ? ' container-box' : '');

    return (
      <div className={'oni-frame text-center ' + cssCls}>
        <div className="oni-frame-content">
          <div className="panel">
              <div className="panel-heading">
                  <h3 className="panel-title pull-left src-only"><strong>{this.props.title}</strong></h3>
                  <ul className="panel-toolbar pull-right">
                    {reloadButton}
                    {resizeButton}
                    {toggleButton}
                  </ul>
              </div>
              <div className="panel-body">
                  <div className={containerCss}>
                    {this.props.children}
                  </div>
              </div>
          </div>
        </div>
      </div>
    );
  },
  _onToggleClick: function ()
  {
    if (this.state.maximized)
    {
      OniActions.restorePanel(this.props.title);
    }
    else
    {
      OniActions.expandPanel(this.props.title);
    }
  },
  _onExpand: function (panel)
  {
    if (this.props.title===panel)
    {
      this.setState({
        minimized: false,
        maximized: true
      });
    }
    else
    {
      this.setState({
        minimized: true,
        maximized: false
      });
    }
  },
  _onRestore: function (panel)
  {
    this.setState({
      minimized: false,
      maximized: false
    });
  },
  _onToggleModeClick: function ()
  {
    OniActions.toggleMode(this.props.title);
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
