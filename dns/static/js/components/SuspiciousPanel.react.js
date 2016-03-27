var React = require('react');

var DnsActions = require('../actions/DnsActions');
var DnsConstants = require('../constants/DnsConstants');

var GridPanelMixin = require('./GridPanelMixin.react');
var SuspiciousStore = require('../stores/SuspiciousStore');

var labelCssClasses, riskCssClasses;

labelCssClasses = {'3':'danger', '2':'warning', '1':'default', '0':'default'};
riskCssClasses = {'3':'high', '2':'medium', '1':'low', '0':'low', '-1':'low'};

var SuspiciousPanel = React.createClass({
  mixins: [GridPanelMixin],
  emptySetMessage: 'There is no data available for selected date',
  getInitialState: function ()
  {
    return SuspiciousStore.getData();
  },
  componentDidMount: function ()
  {
    SuspiciousStore.addChangeDataListener(this._onChange);

    $(this.getDOMNode()).popover({
      trigger: 'hover',
      html: true,
      selector: '[data-toggle="popover"]'
    });
  },
  componentWillUnmount: function ()
  {
    SuspiciousStore.removeChangeDataListener(this._onChange);
  },
  _renderRepCell: function (rawReps)
  {
    var reps, highestRep, key, toolTipContent;

    rawReps = rawReps.split('::');

    if (!rawReps || rawReps.length===0) return '';

    reps = {};
    highestRep = -1;

    rawReps.forEach(function (serviceInfo) {
      var info;

      info = serviceInfo.split(':'); // SERVICE:SERVICE_REPUTATION:ONI_REPUTATION

      reps[info[0]] = {
        'text': info[1],
        'cssClass': labelCssClasses[info[2]] || labelCssClasses[0]
      };

      highestRep = Math.max(highestRep, info[2]);
    });

    toolTipContent = '';
    Object.keys(reps).forEach(function (key) {
      toolTipContent += '<p>' + key + ': <span class="label label-' + reps[key].cssClass + '">' + reps[key].text + '</span></p>';
    });

    return (
      <i className={'fa fa-shield ip-info ' + riskCssClasses[highestRep] + '-risk'}
          data-container="body" data-toggle="popover" data-placement="right" data-content={toolTipContent}>
      </i>
    );
  },
  _render_dns_qry_name_cell: function (query, item)
  {
    var queryRep;

    queryRep = this._renderRepCell(item.query_rep);

    return (
      <p className="dns_qry_name">
        {query} {queryRep}
      </p>
    );
  },
  /**
    * Answers cell can have multiple pipe separated values. To allow
    * proper displaying of information lets place each answer inside
    * a block element let browsers decide how to display them.
    */
  _render_dns_a_cell: function (answers, item, idx)
  {
    var cellBody;

    answers = (answers || []).split('|');

    cellBody = answers.map(function (answer, i)
    {
      return (
        <div key={'answer_' + idx + '_' + i}>
          {answer}
        </div>
      );
    }.bind(this));

    return cellBody;
  },
  // Hidden cells
  _render_resp_h_cell: false,
  _render_query_rep_cell: false,
  _render_hh_cell: false,
  _onChange: function ()
  {
    var state;

    state = SuspiciousStore.getData();

    this.setState(state);
  },
  _onClickRow: function (item)
  {
    this.selectItems(item);

    // Select elements on Network and Details view
    DnsActions.selectThreat(item);
    DnsActions.reloadDetails();
    DnsActions.toggleMode(DnsConstants.DETAILS_PANEL, DnsConstants.DETAILS_MODE);
  },
  _onMouseEnterRow: function (item)
  {
    DnsActions.highlightThreat(item);
  },
  _onMouseLeaveRow: function (item)
  {
    DnsActions.unhighlightThreat(item);
  }
});

module.exports = SuspiciousPanel;
