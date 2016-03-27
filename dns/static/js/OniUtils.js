var d3 = require('d3');

var OniUtils = {
  IP_V4_REGEX: /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/,
  getCurrentDate: function ()
  {
    // Look for a date on location's hash, default to today
    var matches;

    matches = /date=(\d{4}-\d{2}-\d{2})/.exec(location.hash);
    if (matches)
    {
      // Get capturing group
      return matches[1];
    }
    else
    {
        return OniUtils.getDateString(new Date());
    }
  },
  getDateString: function (date)
  {
        return date.toISOString().substr(0, 10);
  },
  getCurrentFilter: function ()
  {
    // Look for a date on location's hash, default to today
    var matches;

    matches = /filter=([^|]+)/.exec(location.hash);
    if (matches)
    {
      // Get capturing group
      return matches[1];
    }

    // Filter is not present
    return null;
  }
};

module.exports = OniUtils;
