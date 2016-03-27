var Dispatcher = require('flux').Dispatcher;

// Create dispatcher instance
var DuxburyBayDispatcher = new Dispatcher();

// Convenience method to handle dispatch requests
DuxburyBayDispatcher.handleServerAction = function(action) {
  this.dispatch({
    source: 'SERVER_ACTION',
    action: action
  });
}

DuxburyBayDispatcher.handleAction = function(action){
	this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
}

module.exports = DuxburyBayDispatcher;