var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');
var RestStore = require('./RestStore');
var OniUtils = require('../OniUtils');
var assign = require('object-assign');

var IP_FILTER = 'ip_dst';
var DNS_FILTER = 'dns_qry_name';

var CHANGE_FILTER_EVENT = 'change_filter';
var CHANGE_DATE_EVENT = 'change_date';
var HIGHLIGHT_THREAT_EVENT = 'hightlight_thread';
var UNHIGHLIGHT_THREAT_EVENT = 'unhightlight_thread';
var SELECT_THREAT_EVENT = 'select_treath';
var MAX_ROWS = 250;

var filter = '';
var filterName = '';
var date = '';
var highlightedThread = null;
var selectedThread = null;
var unfilteredData = null;

var SuspiciousStore = assign(new RestStore(DnsConstants.API_SUSPICIOUS), {
  errorMessages: {
    404: 'Please choose a different date, no data has been found'
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
                    return item[filterName]==filter;
                })
            }
        );
    }

    state.data = state.data.filter(function (item) {
        return item.dns_sev=="0";
    });

    if (state.data.length>MAX_ROWS) state.data = state.data.slice(0, MAX_ROWS);

    return state;
  },
  setData: function (data)
  {
    this._data = unfilteredData = data;
    
    this.emitChangeData();
  },
  setFilter: function (newFilter)
  {
    filter = newFilter;
    
    if (filter==='')
    {
      filterName = '';
      this.removeRestFilter(IP_FILTER);
      this.removeRestFilter(DNS_FILTER);
    }
    else if (OniUtils.IP_V4_REGEX.test(filter))
    {
      this.removeRestFilter(DNS_FILTER);
      this.setRestFilter(IP_FILTER, filter);
      filterName = IP_FILTER;
    }
    else
    {
      this.removeRestFilter(IP_FILTER);
      this.setRestFilter(DNS_FILTER, filter);
      filterName = DNS_FILTER;
    }
    
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
  setDate: function (newDate)
  {
    date = newDate;
    
    this.emitChangeDate();
    
    this.setEndpoint(DnsConstants.API_SUSPICIOUS.replace('${date}', date.replace(/-/g, '')));
  },
  getDate: function ()
  {
    return date;
  },
  emitChangeDate: function () {
    this.emit(CHANGE_DATE_EVENT);
  },
  addChangeDateListener: function (callback) {
    this.on(CHANGE_DATE_EVENT, callback);
  },
  removeChangeDateListener: function (callback) {
    this.removeListener(CHANGE_DATE_EVENT, callback);
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

DnsDispatcher.register(function (action) {
  switch (action.actionType) {
    case DnsConstants.UPDATE_FILTER:
      SuspiciousStore.setFilter(action.filter);
      break;
    case DnsConstants.UPDATE_DATE:
      SuspiciousStore.setDate(action.date);
      break;
    case DnsConstants.RELOAD_SUSPICIOUS:
      SuspiciousStore.reload();
      break;
    case DnsConstants.HIGHLIGHT_THREAT:
      SuspiciousStore.highlightThreat(action.threat);
      break;
    case DnsConstants.UNHIGHLIGHT_THREAT:
      SuspiciousStore.unhighlightThreat();
      break;
    case DnsConstants.SELECT_THREAT:
      SuspiciousStore.selectThreat(action.threat);
      break;
  }
});

module.exports = SuspiciousStore;
