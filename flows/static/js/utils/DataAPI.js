var SconnectsServerActions = require('../actions/SconnectsServerActions');
var d3 = require('d3');
var $ = require('jquery');
var AppConstants = require('../constants/AppConstants');

var sconnects =[];

function stringIsNullOrEmpty(str){
	return str == null || str == '' || str == undefined;
}

var DataAPI = {
	getSconnects: function(date){
		var _date = !stringIsNullOrEmpty(date) ? date : '20150417' //TODO: change harcoded date for a constant
		//var dataUrl = AppConstants.DATA_API.GET_SCONNECTS_URL.replace('##date##', _date).replace('##format##', 'csv');
		var dataUrl = `http://10.219.10.36:8889/files/user/${_date}/lda_scores.csv`;
		return new Promise(function(fullfil, reject){			
			d3.csv(dataUrl, function (error,data){
				if(error != null && error != undefined){
					reject(error);
				}
				fullfil(data);
							
			});
		})
		.then(function(resp) {
			SconnectsServerActions.handleSconnectsFetchSuccess(resp);
		})
		.catch(function(resp) {
			SconnectsServerActions.handleSconnectsFetchFailure(resp);	
		});
	},

	getLogExtracts: function(timestamp, srcip, dstip){
		var hour = !stringIsNullOrEmpty(timestamp) ?  timestamp.split(' ')[1].split(':')[0] : '00';
		var minute = !stringIsNullOrEmpty(timestamp) ?  timestamp.split(' ')[1].split(':')[1] : '00';

		return new Promise(function(fullfil, reject){
			// The following code only aplies for the current data structure (physical files)
			var _date = !stringIsNullOrEmpty(timestamp) ?  timestamp.split(' ')[0].replace(/-/g, "") : '20150417';			
			var _srcip = srcip.replace(/\./g, '_');
			var _dstip = dstip.replace(/\./g, '_');

			d3.tsv(`http://10.219.10.36:8889/files/user/${_date}/edge-${_srcip}-${_dstip}-${hour}-${minute}.tsv`, function (error,data){
				if(error != null && error != undefined){
					reject(error);
				}
				fullfil(data);
							
			});
		})
		.then(function(resp) {
			SconnectsServerActions.handleLogExtractsFetchSuccess(resp);
		})
		.catch(function(resp) {
			SconnectsServerActions.handleLogExtractsFetchFailure(resp);	
		});
	},

	getChordData: function(timestamp, ip){
		var date = timestamp.split(' ')[0].replace(/-/g, '');
		var formattedIp = ip.replace(/\./g, '_');

		return new Promise(function(fullfil, reject){
			d3.tsv(`http://10.219.10.36:8889/files/user/${date}/chord-${formattedIp}.tsv`, function(error, data){
				if(error != null && error != undefined){
					reject(error);
				}
				fullfil({data:data, ip: ip});
			});	
		})
		.then(function(resp){
			SconnectsServerActions.handleChordDataFetchSuccess(resp);
		})
		.catch(function(resp){
			SconnectsServerActions.handleChordDataFetchFailure(resp);
		});

		
	},

	getDnsSconnects: function(date){
		var _date = !stringIsNullOrEmpty(date) ? date : '20150417' //TODO: change harcoded date for a constant
		//var dataUrl = AppConstants.DATA_API.GET_SCONNECTS_URL.replace('##date##', _date).replace('##format##', 'csv');
		var dataUrl = `/files/ipython/flows/user/${_date}/dns_lda_scores.csv`;
		return new Promise(function(fullfil, reject){			
			d3.csv(dataUrl, function (error,data){
				if(error != null && error != undefined){
					reject(error);
				}
				fullfil(data);
							
			});
		})
		.then(function(resp) {
			SconnectsServerActions.handleDnsSconnectsFetchSuccess(resp);
		})
		.catch(function(resp) {
			SconnectsServerActions.handleDnsSconnectsFetchFailure(resp);	
		});
	},

	getTopLevelDomains: function (){
		var url = '/app/dns/static/domainList.csv' //TODO: Change harcoded url for Data API call
		return new Promise(function(fullfil, reject){
			d3.csv(url, function(error, data){
				if(error != null && error != undefined){
					reject(error);
				}
				fullfil(data);
			});
		})
		.then(function(resp){
			SconnectsServerActions.handleTopLevelDomainsFetchSuccess(resp);
		})
		.catch(function(resp){
			SconnectsServerActions.handleTopLevelDomainsFetchFailure(resp);
		})
	}
}

module.exports = DataAPI;
