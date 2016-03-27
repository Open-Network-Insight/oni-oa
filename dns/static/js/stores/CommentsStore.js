var assign = require('object-assign');

var DnsConstants = require('../constants/DnsConstants');
var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var RestStore = require('./RestStore');

var CommentsStore = assign(new RestStore(DnsConstants.API_COMMENTS), {
  errorMessages: {
    404: 'Please choose a different date, no comments have been found'
  },
  setDate: function (newDate)
  {
    date = newDate;

    this.setEndpoint(DnsConstants.API_COMMENTS + '/' + date.replace(/-/g, ''));
  }
});

DnsDispatcher.register(function (action) {
  switch (action.actionType) {
    case DnsConstants.UPDATE_DATE:
      CommentsStore.setDate(action.date);
      break;
    case DnsConstants.RELOAD_COMMENTS:
      CommentsStore.reload();
      break;
  }
});

module.exports = CommentsStore;
