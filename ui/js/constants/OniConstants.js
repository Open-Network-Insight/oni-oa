var OniConstants = {
  // Search Actions
  UPDATE_FILTER: 'UPDATE_FILTER',
  UPDATE_DATE: 'UPDATE_DATE',
  // Panel Actions
  EXPAND_PANEL: 'EXPAND_PANEL',
  RESTORE_PANEL: 'RESTORE_PANEL',
  TOGGLE_MODE_PANEL: 'TOGGLE_MODE_PANEL',
  DETAILS_MODE: 'DETAILS_MODE',
  VISUAL_DETAILS_MODE: 'VISUAL_DETAILS_MODE',
  // Panel
  SUSPICIOUS_PANEL:'Suspicious',
  NETVIEW_PANEL: 'Network View',
  NOTEBOOK_PANEL: 'Notebook',
  DETAILS_PANEL: 'Details',
  // Store Actions
  RELOAD_SUSPICIOUS: 'RELOAD_SUSPICIOUS',
  RELOAD_DETAILS: 'RELOAD_DETAILS',
  RELOAD_VISUAL_DETAILS: 'RELOAD_VISUAL_DETAILS',
  // Edge Investigation
  HIGHLIGHT_THREAT: 'HIGHLIGHT_THREAT',
  UNHIGHLIGHT_THREAT: 'UNHIGHLIGHT_THREAT',
  SELECT_THREAT: 'SELECT_THREAT',
  SELECT_IP: 'SELECT_IP',
  // Server Paths
  NOTEBOOKS_PATH: '/notebooks/ipynb',
  API_SUSPICIOUS: '../../data/flow/${date}/flow_scores.csv',
  API_DETAILS: '../../data/flow/${date}/edge-${src_ip}-${dst_ip}-${time}.tsv',
  API_VISUAL_DETAILS: '../../data/flow/${date}/chord-${ip}.tsv',
  API_COMMENTS: '../../data/flow/${date}/threats',
  API_INCIDENT_PROGRESSION: '../../data/flow/${date}/threat-dendro-${id}'
};

module.exports = OniConstants;
