var OniDispatcher = require('../../../js/dispatchers/OniDispatcher');
var OniConstants = require('../../../js/constants/OniConstants');
var RestStore = require('../../../js/stores/RestStore');
var OniUtils = require('../../../js/utils/OniUtils');
var assign = require('object-assign');

var IP_FILTER = 'ip_dst';

var CHANGE_FILTER_EVENT = 'change_filter';
var HIGHLIGHT_THREAT_EVENT = 'hightlight_thread';
var UNHIGHLIGHT_THREAT_EVENT = 'unhightlight_thread';
var SELECT_THREAT_EVENT = 'select_treath';
var MAX_ROWS = 250;

var filter = '';
var highlightedThread = null;
var selectedThread = null;
var unfilteredData = null;

var SuspiciousStore = assign(new RestStore(OniConstants.API_SUSPICIOUS), {
  errorMessages: {
    404: 'Please choose a different date, no data has been found'
  },
  headers: {
    // TODO: Add Headers
  },
  getData: function ()
  {
    var state;

    if (!filter || !unfilteredData)
    {
        state = this._data;
    }
    else
    {
        state = assign(
            {},
            unfilteredData,
            {
                data: unfilteredData.data.filter(function (item)
                {
                    return item['srcIP']==filter || item['dstIP']==filter;
                })
            }
        );
    }

    state.data = state.data.filter(function (item) {
        return item.sev=='0';
    });

    if (state.data.length>MAX_ROWS) state.data = state.data.slice(0, MAX_ROWS);

    return state;
  },
  setData: function (data)
  {
    this._data = unfilteredData = data;

    this.emitChangeData();
  },
  setDate: function (date)
  {
    this.setEndpoint(OniConstants.API_SUSPICIOUS.replace('${date}', date.replace(/-/g, '')));
  },
  setFilter: function (newFilter)
  {
    filter = newFilter;

    this.emitChangeFilter();
  },
  getFilter: function (){
    return filter;
  },
  emitChangeFilter: function () {
    this.emit(CHANGE_FILTER_EVENT);
  },
  addChangeFilterListener: function (callback) {
    this.on(CHANGE_FILTER_EVENT, callback);
  },
  removeChangeFilterListener: function (callback) {
    this.removeListener(CHANGE_FILTER_EVENT, callback);
  },
  highlightThreat: function (threat)
  {
    highlightedThread = threat;
    this.emitHighlightThreat();
  },
  getHighlightedThreat: function ()
  {
    return highlightedThread;
  },
  addThreatHighlightListener: function (callback)
  {
    this.on(HIGHLIGHT_THREAT_EVENT, callback);
  },
  removeThreatHighlightListener: function (callback)
  {
    this.removeListener(HIGHLIGHT_THREAT_EVENT, callback);
  },
  emitHighlightThreat: function ()
  {
    this.emit(HIGHLIGHT_THREAT_EVENT);
  },
  unhighlightThreat: function ()
  {
    highlightedThread = null;
    this.emitUnhighlightThreat();
  },
  addThreatUnhighlightListener: function (callback)
  {
    this.on(UNHIGHLIGHT_THREAT_EVENT, callback);
  },
  removeThreatUnhighlightListener: function (callback)
  {
    this.removeListener(UNHIGHLIGHT_THREAT_EVENT, callback);
  },
  emitUnhighlightThreat: function ()
  {
    this.emit(UNHIGHLIGHT_THREAT_EVENT);
  },
  selectThreat: function (threat)
  {
    selectedThread = threat;
    this.emitThreatSelect();
  },
  getSelectedThreat: function ()
  {
    return selectedThread;
  },
  addThreatSelectListener: function (callback)
  {
    this.on(SELECT_THREAT_EVENT, callback);
  },
  removeThreatSelectListener: function (callback)
  {
    this.removeListener(SELECT_THREAT_EVENT, callback);
  },
  emitThreatSelect: function ()
  {
    this.emit(SELECT_THREAT_EVENT);
  }
});

OniDispatcher.register(function (action) {
  switch (action.actionType) {
    case OniConstants.UPDATE_FILTER:
      SuspiciousStore.setFilter(action.filter);
      break;
    case OniConstants.UPDATE_DATE:
      SuspiciousStore.setDate(action.date);
      break;
    case OniConstants.RELOAD_SUSPICIOUS:
      SuspiciousStore.reload();
      break;
    case OniConstants.HIGHLIGHT_THREAT:
      SuspiciousStore.highlightThreat(action.threat);
      break;
    case OniConstants.UNHIGHLIGHT_THREAT:
      SuspiciousStore.unhighlightThreat();
      break;
    case OniConstants.SELECT_THREAT:
      SuspiciousStore.selectThreat(action.threat);
      break;
  }
});

module.exports = SuspiciousStore;
