var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');
var RestStore = require('./RestStore');
var assign = require('object-assign');

var DNS_SERVER_FILTER = 'dns_qry_name';
var TIME_FILTER = 'time';

var DetailsStore = assign(new RestStore(DnsConstants.API_DETAILS), {
  errorMessages: {
    404: 'No details available'
  },
  setDate: function (date)
  {
    this.setEndpoint(DnsConstants.API_DETAILS.replace('${date}', date.replace(/-/g, '')));
  },
  setDnsServer: function (dnsServer)
  {
    this.setRestFilter(DNS_SERVER_FILTER, dnsServer);
  },
  setTime: function (time)
  {
    this.setRestFilter(TIME_FILTER, time);
  }
});

DnsDispatcher.register(function (action) {
  switch (action.actionType) {
    case DnsConstants.UPDATE_DATE:
      DetailsStore.setDate(action.date);
      break;
    case DnsConstants.SELECT_THREAT:
      DetailsStore.setDnsServer(action.threat.dns_qry_name);
      DetailsStore.setTime(action.threat.hh+':00');
      break;
    case DnsConstants.RELOAD_SUSPICIOUS:
      DetailsStore.resetData();
      break;
    case DnsConstants.RELOAD_DETAILS:
      DetailsStore.reload();
      break;
  }
});

module.exports = DetailsStore;
