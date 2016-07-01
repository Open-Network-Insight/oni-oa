var NetflowConstants = {
  // Netflow Actions
  RELOAD_INGEST_SUMMARY: 'RELOAD_INGEST_SUMMARY',
  // INGEST SUMMARY
  START_DATE: 'start-date',
  END_DATE: 'end-date',
  // Data source URLS
  API_SUSPICIOUS: '../../data/flow/${date}/flow_scores.csv',
  API_DETAILS: '../../data/flow/${date}/edge-${src_ip}-${dst_ip}-${time}.tsv',
  API_VISUAL_DETAILS: '../../data/flow/${date}/chord-${ip}.tsv',
  API_COMMENTS: '../../data/flow/${date}/threats',
  API_INCIDENT_PROGRESSION: '../../data/flow/${date}/threat-dendro-${id}',
  API_INGEST_SUMMARY: '../../data/flow/ingest_summary/is_${year}${month}.csv'
};

module.exports = NetflowConstants;

