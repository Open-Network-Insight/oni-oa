var React = require('react');

var OniActions = require('../../../js/actions/OniActions');
var EdInActions = require('../../../js/actions/EdInActions');
var OniConstants = require('../../../js/constants/OniConstants');

var GridPanelMixin = require('../../../js/components/GridPanelMixin.react');
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
  _renderRepCell: function (keyPrefix, rawReps)
  {
    var reps, highestRep, key, toolTipContent;

    if (!rawReps) return '';

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
      <i key={keyPrefix + '_rep'} className={'fa fa-shield ' + riskCssClasses[highestRep] + '-risk'}
          data-container="body" data-toggle="popover" data-placement="right" data-content={toolTipContent}>
      </i>
    );
  },
  _render_dns_qry_name_cell: function (query, item, idx)
  {
    var queryRep;

    queryRep = this._renderRepCell('dns_qry_name_' + idx,  item.query_rep);

    return (
      <p key={'dns_qry_name_' + idx}>
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
  _render_ip_dst_cell: function (ip_dst, item, idx)
  {
    var ip_dst_info, iconClass;

    if (item.network_context)
    {
      ip_dst_info = (
        <span className={'fa fa-lg fa-info-circle text-primary'}
            data-container="body" data-toggle="popover" data-placement="right" data-content={item.network_context}>
        </span>
      );
    }

    return (
      <p key={'ip_dst_' + idx}>
        {ip_dst} {ip_dst_info}
      </p>
    );
  },
  // Hidden cells
  _render_dns_qry_class_cell: false,
  _render_dns_qry_type_cell: false,
  _render_dns_qry_rcode_cell: false,
  _render_dns_sev_cell: false,
  _render_domain_cell: false,
  _render_frame_len_cell: false,
  _render_hh_cell: false,
  _render_ip_sev_cell: false,
  _render_network_context_cell: false,
  _render_num_periods_cell: false,
  _render_query_length_cell: false,
  _render_query_rep_cell: false,
  _render_resp_h_cell: false,
  _render_score_cell: false,
  _render_subdomain_cell: false,
  _render_subdomain_entropy_cell: false,
  _render_subdomain_length_cell: false,
  _render_top_domain_cell: false,
  _render_unix_tstamp_cell: false,
  _render_word_cell: false,
  // Event Hanlders
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
    EdInActions.selectThreat(item);
    EdInActions.reloadDetails();
    OniActions.toggleMode(OniConstants.DETAILS_PANEL, OniConstants.DETAILS_MODE);
  },
  _onMouseEnterRow: function (item)
  {
    EdInActions.highlightThreat(item);
  },
  _onMouseLeaveRow: function (item)
  {
    EdInActions.unhighlightThreat(item);
  }
});

module.exports = SuspiciousPanel;
