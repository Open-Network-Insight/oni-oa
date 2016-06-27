var OniDispatcher = require('../dispatchers/OniDispatcher');
var OniConstants = require('../constants/OniConstants');
var OniUtils = require('../utils/OniUtils');

var OniActions = {
  setDate: function (date)
  {
    OniUtils.setUrlParam('date', date);

    OniDispatcher.dispatch({
      actionType: OniConstants.UPDATE_FILTER,
      filter: ''
    });

    OniDispatcher.dispatch({
      actionType: OniConstants.UPDATE_DATE,
      date: date
    });
  },
  expandPanel: function (panel)
  {
    OniDispatcher.dispatch({
      actionType: OniConstants.EXPAND_PANEL,
      panel: panel
    });
  },
  restorePanel: function (panel)
  {
    OniDispatcher.dispatch({
      actionType: OniConstants.RESTORE_PANEL,
      panel: panel
    });
  },
  toggleMode: function (panel, mode)
  {
    OniDispatcher.dispatch({
      actionType: OniConstants.TOGGLE_MODE_PANEL,
      panel: panel,
      mode: mode
    });
  }
};

module.exports = OniActions;
