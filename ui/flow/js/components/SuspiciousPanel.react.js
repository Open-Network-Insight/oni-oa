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
  _renderGeoCell: function (keyPrefix, geo, domain)
  {
    var toolTipContent;

    toolTipContent = '<p>Geo location: <strong>' + geo + '</strong></p>';
    toolTipContent+= '<p>Domain: <strong>' + domain + '</strong></p>';

    return (
      <i key={keyPrefix + '_geo'}className="fa fa-globe" data-container="body" data-toggle="popover" data-placement="right" data-content={toolTipContent}></i>
    );
  },
  _renderIpCell: function (keyPrefix, ip, isInternal, geo, domain, rep) {
    var internalCssCls, ipContent = [];

    internalCssCls = isInternal ? 'label label-primary' : '';

    ipContent.push(
      <span key={keyPrefix + '_label'} className={internalCssCls}>{ip} </span>
    );

    if (!isInternal) {
      ipContent.push(
         this._renderGeoCell(keyPrefix, geo, domain)
      );

      ipContent.push(
        this._renderRepCell(keyPrefix, rep)
      );
    }

    return ipContent;
  },
  /**
   *  Renders the source IP cell.
   *
   *  Renders the IP text along with a shild representing the reputation of that IP
   *
   *  @param  srcIP {String}  The source IP
   *  @param  item  {Object}  The current item being rendered.
   *  @param  idx   {Number}  The item index in the parent array
   *
   *  @return React Component
   **/
  _render_srcIP_cell: function (srcIp, item, idx)
  {
    var srcIpContent;

    srcIpContent = this._renderIpCell('src_' + idx, item.srcIP, +item.srcIpInternal, item.srcGeo, item.srcDomain, item.srcIP_rep);

    return (
      <p key={'srcIP_' + idx} className="srcIP">
        {srcIpContent}
      </p>
    );
  },
  /**
   *  Renders the destination IP cell.
   *
   *  Renders the IP text along with a shild representing the reputation of that IP
   *
   *  @param  srcIP {String}  The destination IP
   *  @param  item  {Object}  The current item being rendered.
   *  @param  idx   {Number}  The item index in the parent array
   *
   *  @return React Component
   **/
  _render_dstIP_cell: function (dstIp, item, idx)
  {
    var dstIpContent;

    dstIpContent = this._renderIpCell('dst_' + idx, item.dstIP, +item.destIpInternal, item.dstGeo, item.dstDomain, item.dstIP_rep);

    return (
      <p key={'dstIP_' + idx} className="srcIP">
        {dstIpContent}
      </p>
    );
  },
  // Hidden cells
  _render_destIpInternal_cell: false,
  _render_dstDomain_cell: false,
  _render_dstGeo_cell: false,
  _render_dstIP_rep_cell: false,
  _render_flag_cell: false,
  _render_lda_score_cell: false,
  _render_srcDomain_cell: false,
  _render_srcGeo_cell: false,
  _render_srcIP_rep_cell: false,
  _render_srcIpInternal_cell: false,
  _render_sev_cell: false,
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
