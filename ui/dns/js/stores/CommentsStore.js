var assign = require('object-assign');

var OniDispatcher = require('../../../js/dispatchers/OniDispatcher');
var OniConstants = require('../../../js/constants/OniConstants');
var DnsConstants = require('../constants/DnsConstants');
var RestStore = require('../../../js/stores/RestStore');

var CommentsStore = assign(new RestStore(DnsConstants.API_COMMENTS), {
  _parser: d3.dsv('|', 'text/plain'),
  errorMessages: {
    404: 'Please choose a different date, no comments have been found'
  },
  setDate: function (newDate)
  {
    date = newDate;

    this.setEndpoint(DnsConstants.API_COMMENTS.replace('${date}', date.replace(/-/g, '')));
  }
});

OniDispatcher.register(function (action) {
  switch (action.actionType) {
    case OniConstants.UPDATE_DATE:
      CommentsStore.setDate(action.date);
      break;
    case OniConstants.RELOAD_COMMENTS:
      CommentsStore.reload();
      break;
  }
});

module.exports = CommentsStore;
