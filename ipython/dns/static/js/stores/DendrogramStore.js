var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');
var RestStore = require('./RestStore');
var assign = require('object-assign');

var SRC_IP_FILTER = 'ip_dst';

var DendrogramStore = assign(new RestStore(DnsConstants.API_VISUAL_DETAILS), {
  setDate: function (date)
  {
    this.setEndpoint(DnsConstants.API_VISUAL_DETAILS.replace('${date}', date.replace(/-/g, '')));
  },
  setSrcIp: function (srcIp)
  {
    this.setRestFilter(SRC_IP_FILTER, srcIp);
  },
  getSrcIp: function ()
  {
    return this.getRestFilter(SRC_IP_FILTER);
  }
});

DnsDispatcher.register(function (action) {
  switch (action.actionType) {
    case DnsConstants.UPDATE_DATE:
      DendrogramStore.setDate(action.date);
      break;
    case DnsConstants.SELECT_SRC_IP:
      DendrogramStore.setSrcIp(action.srcIp);
      break;
    case DnsConstants.RELOAD_SUSPICIOUS:
      DendrogramStore.setSrcIp('');
      DendrogramStore.resetData();
      break;
    case DnsConstants.RELOAD_DETAILS_VISUAL:
      DendrogramStore.reload();
      break;
  }
});

module.exports = DendrogramStore;
