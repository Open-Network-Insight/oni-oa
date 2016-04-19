var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');

var date = '';
var filter = '';

function updateLocationHash ()
{
  var localDate;

  location.hash = 'date=' + date +(filter!==''? '|filter=' + filter : '');

  $('.oni-dated-link').each(function ()
  {
    var link = $(this);

    link.attr('href', link.data('href').replace(/\$\{date\}/g, date));
  });

  localDate = date.replace(/-/g, '');
  $('.oni-shrinked-dated-link').each(function ()
  {
    var link = $(this);

    link.attr('href', link.data('href').replace(/\$\{date\}/g, localDate));
  });
}

var DnsActions = {
  setFilter: function (newFilter)
  {
    filter = newFilter;

    updateLocationHash();

    DnsDispatcher.dispatch({
      actionType: DnsConstants.UPDATE_FILTER,
      filter: filter
    });
  },
  setDate: function (newDate)
  {
    filter = '';
    date = newDate;

    updateLocationHash();

    DnsDispatcher.dispatch({
      actionType: DnsConstants.UPDATE_FILTER,
      filter: filter
    });

    DnsDispatcher.dispatch({
      actionType: DnsConstants.UPDATE_DATE,
      date: date
    });
  },
  reloadSuspicious: function () {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.RELOAD_SUSPICIOUS
    });
  },
  reloadDetails: function () {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.RELOAD_DETAILS
    });
  },
  reloadVisualDetails: function () {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.RELOAD_DETAILS_VISUAL
    });
  },
  expandPanel: function (panel)
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.EXPAND_PANEL,
      panel: panel
    });
  },
  restorePanel: function (panel)
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.RESTORE_PANEL,
      panel: panel
    });
  },
  highlightThreat: function (id)
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.HIGHLIGHT_THREAT,
      threat: id
    });
  },
  unhighlightThreat: function ()
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.UNHIGHLIGHT_THREAT
    });
  },
  selectThreat: function (threat)
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.SELECT_THREAT,
      threat: threat
    });
  },
  selectSrcIp: function (srcIp)
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.SELECT_SRC_IP,
      srcIp: srcIp
    });
  },
  toggleMode: function (panel, mode)
  {
    DnsDispatcher.dispatch({
      actionType: DnsConstants.TOGGLE_MODE_PANEL,
      panel: panel,
      mode: mode
    });
  }
};

module.exports = DnsActions;
