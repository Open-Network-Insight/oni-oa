var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');

var PANEL_EXPAND_EVENT = 'panel_expand';
var PANEL_RESTORE_EVENT = 'panel_restore';
var PANEL_TOGGLE_MODE_EVENT = 'panel_toggle_mode';

var DnsAppStore = assign({}, EventEmitter.prototype, {
  addPanelExpandListener: function (callback)
  {
    this.on(PANEL_EXPAND_EVENT, callback);
  },
  removePanelExpandListener: function (callback)
  {
    this.removeListener(PANEL_EXPAND_EVENT, callback);
  },
  emitPanelExpand: function (panel)
  {
    this.emit(PANEL_EXPAND_EVENT, panel);
  },
  addPanelRestoreListener: function (callback)
  {
    this.on(PANEL_RESTORE_EVENT, callback);
  },
  removePanelRestoreListener: function (callback)
  {
    this.removeListener(PANEL_EXPAND_EVENT, callback);
  },
  emitPanelRestore: function (panel)
  {
    this.emit(PANEL_RESTORE_EVENT, panel);
  },
  addPanelToggleModeListener: function (callback)
  {
    this.on(PANEL_TOGGLE_MODE_EVENT, callback);
  },
  removePanelToggleModeListener: function (callback)
  {
    this.removeListener(PANEL_TOGGLE_MODE_EVENT, callback);
  },
  emitPanelToggleMode: function (panel, mode)
  {
    this.emit(PANEL_TOGGLE_MODE_EVENT, panel, mode);
  },
});

DnsDispatcher.register(function (action) {
  switch (action.actionType) {
    case DnsConstants.EXPAND_PANEL:
      DnsAppStore.emitPanelExpand(action.panel);
      break;
    case DnsConstants.RESTORE_PANEL:
      DnsAppStore.emitPanelRestore(action.panel);
      break;
    case DnsConstants.TOGGLE_MODE_PANEL:
      DnsAppStore.emitPanelToggleMode(action.panel, action.mode);
      break;
  }
});

module.exports = DnsAppStore;