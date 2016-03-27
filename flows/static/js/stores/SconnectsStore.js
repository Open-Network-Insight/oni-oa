var DuxburyBayDispatcher = require('../dispatcher/DuxburyBayDispatcher');
var EventEmmitter = require('events');
var SconnectsActions = require('../actions/SconnectsActions');
var _ = require('underscore');
var AppConstants = require('../constants/AppConstants');

var _loading = false;
var _error = null;
var _allSconnects = [];
var _sconnects = [];


var SconnectsStore = _.extend({}, EventEmmitter.prototype,{
	
	sconnects: [],

	allSconnects: [],

	loading: false,

	error: null,

	selectedConnection: null,

	dataDate:null,

	type: null,

	topLevelDomains: [],

	getState: function(){		
		return {
			loading: this.loading,
			error: this.error,
			sconnects: this.sconnects,
			selectedConnection: this.selectedConnection,			
			dataDate: this.dataDate,
			type: this.type
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
	var text;

	switch(action.actionType){
		case AppConstants.SCONNECTS_ACTIONS.GET_SCONNECTS:			
			SconnectsStore.loading = true;		
			SconnectsStore.dataDate = action.dataDate;	
			SconnectsStore.type = "NETFLOW";
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_SCONNECTS_DATA_SUCCESS:
			SconnectsStore.loading = false;
			SconnectsStore.error = null;
			SconnectsStore.sconnects = action.sconnects.splice(0,250);
			SconnectsStore.allSconnects = SconnectsStore.sconnects;
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_SCONNECTS_DATA_FAILURE:
			SconnectsStore.loading = false;
			SconnectsStore.error =  action.error;
		break;

		case AppConstants.SCONNECTS_ACTIONS.GET_DNS_SCONNECTS:
			SconnectsStore.loading = true;
			SconnectsStore.dataDate = action.dataDate;	
			SconnectsStore.type = "DNS";
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_DNS_SCONNECTS_DATA_SUCCESS:
			SconnectsStore.loading = false;
			SconnectsStore.error = null;
			SconnectsStore.sconnects = action.sconnects.splice(0,250);
			SconnectsStore.allSconnects = SconnectsStore.sconnects;
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_DNS_SCONNECTS_DATA_FAILURE:
			SconnectsStore.loading = false;
			SconnectsStore.error =  action.error;
		break;

		case AppConstants.SCONNECTS_ACTIONS.FILTER_SCONNECTS:
			if(action.ipFilter != ''){
				if(SconnectsStore.type == 'DNS'){
					SconnectsStore.sconnects = SconnectsStore.allSconnects.filter(function(d){
						 return d.ip_dst == action.ipFilter || d.dns_resp_name.indexOf(action.ipFilter) > -1 
					});
				}
				else if(SconnectsStore.type == 'NETFLOW'){
					SconnectsStore.sconnects = SconnectsStore.allSconnects.filter(function(d){
						 return d.srcIP == action.ipFilter || d.dstIP == action.ipFilter
					});
				}
			}
			else{
				SconnectsStore.sconnects = SconnectsStore.allSconnects;
			}
		break;
		
		case AppConstants.SCONNECTS_ACTIONS.GET_TOP_DOMAINS:
			SconnectsStore.loading = true;
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_TOP_DOMAINS_DATA_SUCCESS:
			SconnectsStore.loading = false;
			SconnectsStore.topLevelDomains = action.domains;			
		break;

		case AppConstants.SCONNECTS_SERVER_ACTIONS.GET_TOP_DOMAINS_DATA_FAILURE:
			SconnectsStore.loading = false;
			SconnectsStore.error = action.error;			
		break;

		case AppConstants.SCONNECTS_ACTIONS.COMMIT_SCORE:

			var filters = [action.srcip, action.dstip, action.sport, action.dport]			
			var filterStr = filters.join("");
			for (var i = 0; i < SconnectsStore.allSconnects.length; i++) {
				var rowExp = SconnectsStore.allSconnects[i].srcIP + SconnectsStore.allSconnects[i].dstIP + SconnectsStore.allSconnects[i].sport + SconnectsStore.allSconnects[i].dport;
				if (rowExp.includes(filterStr)){
					SconnectsStore.allSconnects[i].sev = action.risk
				}
			}	
		break;

		case AppConstants.SCONNECTS_ACTIONS.RUN_SCORING_RULES:		
			SconnectsStore.loading = true;	
			for (var i = 0; i < SconnectsStore.allSconnects.length; i++) {
				var sport = +SconnectsStore.allSconnects[i].sport;
				var dport = +SconnectsStore.allSconnects[i].dport;
				var ipkt = +SconnectsStore.allSconnects[i].ipkt;
				var ibyt = +SconnectsStore.allSconnects[i].ibyt;

				Object.keys(AppConstants.FLOW_FILTER_RULES).forEach(function(key){
					if (eval(AppConstants.FLOW_FILTER_RULES[key].expression)){
						SconnectsStore.allSconnects[i].sev = AppConstants.FLOW_FILTER_RULES[key].risk;
					}
				});
			};
			SconnectsStore.loading = false;
		break;

		default:
			return true;
	}

	SconnectsStore.emitChange();

	return true;
});

module.exports = SconnectsStore;