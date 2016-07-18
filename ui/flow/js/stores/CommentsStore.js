var d3 = require('d3');
var assign = require('object-assign');

var OniConstants = require('../../../js/constants/OniConstants');
var NetflowConstants = require('../constants/NetflowConstants');
var OniDispatcher = require('../../../js/dispatchers/OniDispatcher');
var RestStore = require('../../../js/stores/RestStore');

var CommentsStore = assign(new RestStore(NetflowConstants.API_COMMENTS), {
  _parser: d3.dsv('|', 'text/plain'),
  errorMessages: {
    404: 'Please choose a different date, no comments have been found'
  },
  setDate: function (newDate)
  {
    date = newDate;
    this.setEndpoint(NetflowConstants.API_COMMENTS.replace('${date}', date.replace(/-/g, '')));
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
