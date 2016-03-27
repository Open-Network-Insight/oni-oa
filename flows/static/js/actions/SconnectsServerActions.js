var DuxburyBayDispatcher = require('../dispatcher/DuxburyBayDispatcher');
var AppConstants = require('../constants/AppConstants');
var SconnectsServerActions = {
    /*===================== Netflow Suspicious Connects Scores Actions==============================*/
	handleSconnectsFetchSuccess: function (sconnects) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_SCONNECTS_DATA_SUCCESS,
            sconnects: sconnects            
        });
    },

    handleSconnectsFetchFailure: function (resp) {
    	'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_SCONNECTS_DATA_FAILURE,
            error: resp
        });
    },

    /*===================== DNS Suspicious Connects Scores Actions==============================*/
    handleDnsSconnectsFetchSuccess: function (sconnects) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_DNS_SCONNECTS_DATA_SUCCESS,
            sconnects: sconnects            
        });
    },

    handleDnsSconnectsFetchFailure: function (resp) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_DNS_SCONNECTS_DATA_FAILURE,
            error: resp
        });
    },

    /*=============================Log Extracts Server Actions==============================*/
    handleLogExtractsFetchSuccess: function (logExtracts) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_LOG_EXTRACTS_DATA_SUCCESS,
            logExtracts: logExtracts            
        });
    },
    
    handleLogExtractsFetchFailure: function (resp) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_LOG_EXTRACTS_DATA_FAILURE,
            error: resp
        });
    },

    /*=============================Chord Data Server Actions ==============================*/
    
    handleChordDataFetchSuccess: function (chordData) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_CHORD_DATA_SUCCESS,
            chordData: chordData.data,
            ip: chordData.ip            
        });
    },
    
    handleChordDataFetchFailure: function (resp) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_CHORD_DATA_FAILURE,
            error: resp
        });
    },

    handleTopLevelDomainsFetchSuccess: function(domains){
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_TOP_DOMAINS_DATA_SUCCESS,
            domains: domains
        });
    },

    handleTopLevelDomainsFetchFailure: function (resp) {
        'use-strict';
        DuxburyBayDispatcher.handleServerAction({
            actionType: AppConstants.SCONNECTS_SERVER_ACTIONS.GET_TOP_DOMAINS_DATA_FAILURE,
            error: resp
        });
    },
};

module.exports = SconnectsServerActions;