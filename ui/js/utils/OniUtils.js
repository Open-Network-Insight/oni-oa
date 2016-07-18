var OniUtils = {
  IP_V4_REGEX: /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/,
  getCurrentDate: function (name)
  {
    // Look for a date on location's hash, default to today
    var date;

    date = OniUtils.getUrlParam(name || 'date');

    if (date)
    {
      return date;
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
    return OniUtils.getUrlParam('filter');
  },
  getUrlParam: function (name, defaultValue)
  {
    // Look for a date on location's hash, default to today
    var matches;

    matches = new RegExp(name + '=([^|]+)').exec(location.hash);
    if (matches)
    {
      // Get capturing group
      return matches[1];
    }

    // Filter is not present
    return defaultValue || null;
  },
  setUrlParam: function (name, value) {
    var regex, hash, replacement, matches;

    regex = new RegExp('((?:#|\\|)' + name + '=)[^|]+');
    hash = window.location.hash;

    matches = regex.exec(hash);

    if (matches) {
      replacement = value ? (matches[1]  + value) : '';
      hash = hash.replace(regex, replacement);
    }
    else if (value)
    {
      hash = hash + (hash.length>1?'|':'') + name + '=' + value;
    }

    window.location.hash = hash;
  }
};

module.exports = OniUtils;
