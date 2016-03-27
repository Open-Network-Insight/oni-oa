

var AppConstants = function (){
	return {
		LOG_EXTRACTS_COLUMNS: ["tstart", "srcip", "dstip", "sport", "dport", "proto", "flags", "tos", "pkts", "bytes", "input", "output"],
		SCORES_COLUMNS: ["rank", "tstart", "srcIP", "dstIP", "sport", "dport", "proto", "ipkt", "ibyt"],
		DNS_SCORES_COLUMNS:  ["frame_time", "frame_len", "ip_src", "ip_dst", "dns_resp_name", "dns_resp_type", "dns_resp_class", "dns_flags", "dns_flags_rcode", "dns_a"],
		AUTH_API_LOGIN_URL: "http://10.219.10.68:8080/api/v1/login",
		AUTH_API_LOGOUT_URL: "http://10.219.10.68:8080/api/v1/logout",
		DATA_API: {
			GET_SCONNECTS_URL: 'http://localhost:8080/api/v1/sconnects/##date##/##format##'
		},
		SCONNECTS_ACTIONS: {
			GET_SCONNECTS: 'GET_SCONNECTS',
			GET_DNS_SCONNECTS: 'GET_DNS_SCONNECTS',
			GET_LOG_EXTRACTS: 'GET_LOG_EXTRACTS',
			FILTER_SCONNECTS: 'FILTER_SCONNECTS',
			GET_CHORD_DATA: 'GET_CHORD_DATA',
			SELECT_CONNECTION: 'SELECT_CONNECTION',
			GET_TOP_DOMAINS: 'GET_TOP_DOMAINS',
			SCORING_CHKBOX_CHANGE: 'SCORING_CHKBOX_CHANGE',
			ASSIGN_SCORE: 'ASSIGN_SCORE',
			COMMIT_SCORE: 'COMMIT_SCORE',
			RUN_SCORING_RULES: 'RUN_SCORING_RULES',
			REFRESH_FIELDS: 'REFRESH_FIELDS'
		},
		SCONNECTS_SERVER_ACTIONS:{
			GET_SCONNECTS_DATA_SUCCESS: 'GET_SCONNECTS_DATA_SUCCESS',
			GET_DNS_SCONNECTS_DATA_SUCCESS: 'GET_DNS_SCONNECTS_DATA_SUCCESS',
			GET_LOG_EXTRACTS_DATA_SUCCESS: 'GET_LOG_EXTRACTS_DATA_SUCCESS',
			GET_SCONNECTS_DATA_FAILURE: 'GET_SCONNECTS_DATA_FAILURE',
			GET_DNS_SCONNECTS_DATA_FAILURE: 'GET_DNS_SCONNECTS_DATA_FAILURE',
			GET_LOG_EXTRACTS_DATA_FAILURE: 'GET_LOG_EXTRACTS_DATA_FAILURE',
			GET_CHORD_DATA_FAILURE: 'GET_CHORD_DATA_FAILURE',
			GET_CHORD_DATA_SUCCESS: 'GET_CHORD_DATA_SUCCESS',
			GET_TOP_DOMAINS_DATA_FAILURE: 'GET_TOP_DOMAINS_DATA_FAILURE',
			GET_TOP_DOMAINS_DATA_SUCCESS: 'GET_TOP_DOMAINS_DATA_SUCCESS'

		},
		FLOW_FILTER_RULES:{
			RULE_1: {expression: 'dport <= 1024 && ibyt <= 54', risk: 2},
			RULE_2: {expression: 'dport <= 1024 && ipkt == 3 && ibyt == 152', risk: 2},
			RULE_3: {expression: 'dport <= 1024 && ipkt == 2 && ibyt == 104', risk: 2},
			RULE_4: {expression: 'sport == 0 && dport <= 1023', risk: 2},
		}


	}
}();

module.exports = AppConstants;