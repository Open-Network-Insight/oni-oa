var ProxyConstants = {
  // API URLS
  API_SUSPICIOUS: '../../data/proxy/${date}/proxy_scores.csv',
  API_DETAILS: '../../data/proxy/${date}/edge-${clientip}-${hash}.tsv',
  API_COMMENTS: '../../data/proxy/${date}/threats.csv'
};

module.exports = ProxyConstants;
