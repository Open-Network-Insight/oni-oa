var DuxburyBayDispatcher = require('../dispatcher/DuxburyBayDispatcher');
var EventEmmitter = require('events');
var _ = require('underscore');
var AppConstants = require('../constants/AppConstants');

var _loading = false;
var _error = null;
var _logExtracts = [];
var _chordData = [];
var _ip = null;

var SconnectsDetailsStore = _.extend({}, EventEmmitter.prototype, {
	getState: function(){		
		return {
			loading: _loading,
			error: _error,
			logExtracts: _logExtracts,
			chordData: _chordData,
			ip: _ip
		};
	},
	 // Emit Change event
	emitChange: function() {
		this.emit('change');
	},

  	// Add change listener
  	addChangeListener: function(callback) {
    	this.on('change', callback);
  	},

	// Remove change listener
	removeChangeListener: function(callback) {
		this.removeListener('change', callback);
	}
});

DuxburyBayDispatcher.register(function(payload){
	var action = payload.action;	

	switch(action.actionType){
		case AppConstants.SCONNECTS_ACTIONS.GET_LOG_EXTRACTS:			
			_loading = true;
			_chordData = [];
			_ip = null;
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_LOG_EXTRACTS_DATA_SUCCESS:
			_loading = false;
			_error = null;
			_logExtracts = action.logExtracts;			
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_LOG_EXTRACTS_DATA_FAILURE:
			_loading = false;
			_error =  action.error;		
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_CHORD_DATA_SUCCESS:
			_loading = false;
			_error = null;
			_chordData = action.chordData;
			_ip = action.ip;
			break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_CHORD_DATA_FAILURE:
			_loading = false;
			_error = action.error;			
			break;

		case AppConstants.SCONNECTS_ACTIONS.GET_CHORD_DATA:
			_loading = true;
			_logExtracts = [];
			break;

		default:
			return true;
	}

	SconnectsDetailsStore.emitChange();

	return true;
});

module.exports = SconnectsDetailsStore;