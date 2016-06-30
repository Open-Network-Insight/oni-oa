var OniDispatcher = require('../../../js/dispatchers/OniDispatcher');
var NetflowConstants = require('../constants/NetflowConstants');

var InSumActions = {
  setStartDate: function (date) {
    OniDispatcher.dispatch({
      actionType: NetflowConstants.UPDATE_START_DATE,
      date: date
    });
  },
  setEndDate: function (date) {
    OniDispatcher.dispatch({
      actionType: NetflowConstants.UPDATE_END_DATE,
      date: date
    });
  },
  reloadSummary: function () {
    OniDispatcher.dispatch({
      actionType: NetflowConstants.RELOAD_INGEST_SUMMARY
    });
  }
};

module.exports = InSumActions;
