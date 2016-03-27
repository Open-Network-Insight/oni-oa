var Dispatcher = require('flux').Dispatcher;

// Create dispatcher instance$
var DnsDispatcher = new Dispatcher();

// Convenience method to handle dispatch requests$
DnsDispatcher.handleServerAction = function(action) {
  this.dispatch({
    source: 'SERVER_ACTION',
    action: action
  });
}

DnsDispatcher.handleAction = function(action) {
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
}

module.exports = DnsDispatcher;
