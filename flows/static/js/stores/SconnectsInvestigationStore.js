var DuxburyBayDispatcher = require('../dispatcher/DuxburyBayDispatcher');
var EventEmmitter = require('events');
var _ = require('underscore');
var AppConstants = require('../constants/AppConstants');
var SconnectsActions = require('../actions/SconnectsActions');


var SconnectsInvestigationStore = _.extend({}, EventEmmitter.prototype, {
	loading: false,

	error: null,

	connection: null,

	srcIp: null,

	destIp: null,

	srcPort: null,

	destPort: null,

	risk: null,

	getState: function(){		
		return {
			loading: this.loading,
			error: this.error,
			connection: this.connection,
			srcIp: this.srcIp,	
			destIp: this.destIp,
			srcPort: this.srcPort,
			destPort: this.destPort,
			risk: this.risk
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
		case AppConstants.SCONNECTS_ACTIONS.SELECT_CONNECTION:			
			SconnectsInvestigationStore.loading = false;			
			SconnectsInvestigationStore.connection = action.selectedConnection;
			SconnectsInvestigationStore.error = null;
		break;	

		case AppConstants.SCONNECTS_ACTIONS.SCORING_CHKBOX_CHANGE:
			SconnectsInvestigationStore.srcIp = action.selection.srcIp ? SconnectsInvestigationStore.connection.srcip : null;
			SconnectsInvestigationStore.destIp = action.selection.destIp ? SconnectsInvestigationStore.connection.dstip: null;
			SconnectsInvestigationStore.srcPort = action.selection.srcPort ? SconnectsInvestigationStore.connection.sport: null;			
			SconnectsInvestigationStore.destPort = action.selection.destPort ? SconnectsInvestigationStore.connection.dport: null;
		break;

		case AppConstants.SCONNECTS_ACTIONS.REFRESH_FIELDS:
			SconnectsInvestigationStore.srcIp = null;
			SconnectsInvestigationStore.destIp = null;
			SconnectsInvestigationStore.srcPort = null;			
			SconnectsInvestigationStore.destPort = null;
			SconnectsInvestigationStore.connection = null;
		break;

		/*case AppConstants.SCONNECTS_ACTIONS.ASSIGN_SCORE:
			SconnectsInvestigationStore.risk = action.risk;
			SconnectsInvestigationStore.risk = null;
		break;
		*/
		default:
			return true;
	}

	SconnectsInvestigationStore.emitChange();

	return true;
});

module.exports = SconnectsInvestigationStore;