var DuxburyBayDispatcher = require('../dispatcher/DuxburyBayDispatcher');
var DataAPI = require('../utils/DataAPI');
var AppConstants = require('../constants/AppConstants');

var SconnectsActions = {    
    getSconnects: function(date){
    	'use-strict';
    	DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.GET_SCONNECTS,
            dataDate: date         
        });
    	DataAPI.getSconnects(date);
    },
    getDnsSconnects: function(date){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.GET_DNS_SCONNECTS,
            dataDate: date           
        });
        DataAPI.getDnsSconnects(date);
    },
    getLogExtracts: function(timestamp, srcip, destip){
    	'use-strict';
    	DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.GET_LOG_EXTRACTS
        });
    	DataAPI.getLogExtracts(timestamp, srcip, destip);	
    },
    filterSconnects: function(ipFilter){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.FILTER_SCONNECTS,
            ipFilter: ipFilter            
        });
    },
    getChordData: function(date,ip){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.GET_CHORD_DATA,
            ip: ip            
        });  
        DataAPI.getChordData(date, ip);
    },

    selectConnection: function(conn){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.SELECT_CONNECTION,
            selectedConnection: conn
        });
    },

    getTopLevelDomains: function(){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.GET_TOP_DOMAINS           
        });
        DataAPI.getTopLevelDomains();
    },

    changeScoreChkBox: function(selection){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.SCORING_CHKBOX_CHANGE,
            selection: selection            
        });
    },

    assignScore: function(risk){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.ASSIGN_SCORE
        });
    },

    commitScoring: function(srcip, dstip, sport, dport, risk){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.COMMIT_SCORE,
            srcip: srcip,
            dstip: dstip,
            sport: sport,
            dport: dport,
            risk: risk
        });
    },

    runScoringRules: function(){
       'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.RUN_SCORING_RULES
        }); 
    },

    refreshFields:function(){
        'use-strict';
        DuxburyBayDispatcher.handleAction({
            actionType: AppConstants.SCONNECTS_ACTIONS.REFRESH_FIELDS
        }); 
    }

};

module.exports = SconnectsActions;
