var React = require('react');
var SconnectsStore = require('../../stores/SconnectsStore');
var SconnectsActions = require('../../actions/SconnectsActions');
var SconnectsNetwork = require('./SconnectsNetwork');
var SconnectsInvestigation = require('./SconnectsInvestigation');
var Spinner = require('../layout/Spinner');
var _ = require('underscore');
var $ = require('jquery');
var Utils = require('../../utils/Utils');
var AppConstants = require('../../constants/AppConstants');
var History = require('react-router').History;

var risks ={
    "-1": "Risk Undefined",
    "1": "Low",
    "2": "Medium",
    "3": "High",
    "4": "Extreme",
}

var cssRisks = {
    "-1": "low-risk",
    "1": "low-risk",
    "2": "medium-risk",
    "3": "high-risk",
    "4": "high-risk",
}

var cssRisksLabels = {
    "low": "label label-default",
    "medium": "label label-warning",
    "high": "label label-danger",
    "extreme": "label label-danger"
}

function getRiskClass(gtiRep, norseRep){
    var gti = Number.isNaN(+(gtiRep)) ? -1 : +(gtiRep);
    var norse = Number.isNaN(+(norseRep)) ? -1 : +(norseRep);

    var highest = -1;

    if (gti >= norse){
        highest = gti
    }
    else{
        highest = norse
    }

    return cssRisks[highest.toString()] == undefined ? cssRisks["-1"] : cssRisks[highest.toString()];

}

function onRowClick(sconnect_type){    
    return function(e){

        SconnectsInvestigation.resetCheckBoxes();
        SconnectsInvestigation.resetScoresButtons();

        $('tr.warning').toggleClass("warning");
        $(e.currentTarget).toggleClass("warning");
        if(sconnect_type == "NETFLOW"){            
            var timestap = $($(e.currentTarget).children()[0]).text();
            var srcip = $($(e.currentTarget).children()[1]).text();
            var dstip = $($(e.currentTarget).children()[2]).text();
            SconnectsActions.getLogExtracts(timestap, srcip, dstip);
            SconnectsNetwork.selectConnection(srcip,dstip);
            var conn = {
                srcip: $($(e.currentTarget).children()[1]).text(),
                dstip: $($(e.currentTarget).children()[2]).text(),
                sport: $($(e.currentTarget).children()[3]).text(),
                dport: $($(e.currentTarget).children()[4]).text()
            }
            SconnectsActions.selectConnection(conn);
        }
        else if(sconnect_type =='DNS'){
            var timestap = $($(e.currentTarget).children()[0]).text();
            var respName = $($(e.currentTarget).children()[4]).text();
            var dstip = $($(e.currentTarget).children()[3]).text();
            SconnectsNetwork.selectConnection(respName,dstip);
        }
    }
    
}

function onRowMouseOver(sconnect_type){
    return function(e){
        if(sconnect_type == "NETFLOW"){
            var srcip = $($(e.currentTarget).children()[1]).text();
            var dstip = $($(e.currentTarget).children()[2]).text();
            SconnectsNetwork.fadeNetworkChart(srcip,dstip);
        }
        else if(sconnect_type == 'DNS'){
            var respName = $($(e.currentTarget).children()[4]).text();
            var dstip = $($(e.currentTarget).children()[3]).text();
            SconnectsNetwork.fadeNetworkChart(respName,dstip);
        }
    }
}
function onRowMouseOut(sconnect_type){
    return function(e){
        var selectedRow = $('tr.warning');    
        if(sconnect_type == "NETFLOW"){            
            var srcip = null;
            var dstip = null;
            var selectedEdge = null;
            if(selectedRow.length > 0){
                srcip = $(selectedRow.children()[1]).text()
                dstip = $(selectedRow.children()[2]).text()
                selectedEdge = "k" + srcip.replace(/\./g, "_") + '-' + dstip.replace(/\./g, "_");
            }
            SconnectsNetwork.recoverNetworkChart(selectedEdge);
        }
        else if(sconnect_type == 'DNS'){
            var respName = null;
            var dstip = null;
            if(selectedRow.length > 0){
                respName = $(selectedRow.children()[4]).text()
                dstip = $(selectedRow.children()[3]).text()
                selectedEdge = "k" + respName.replace(/\./g, "_") + '-' + dstip.replace(/\./g, "_");
            }
            SconnectsNetwork.recoverNetworkChart(selectedEdge);
        }

    }
}

function onShieldMouseOver(sconnect_type){
    return function(e){
        if(sconnect_type == "NETFLOW"){
            var data = e.currentTarget.dataset;
            var gtiLabelClass = cssRisksLabels[data.gti.toLowerCase()];
            var norseLabelClass = cssRisksLabels[data.norse.toLowerCase()];

            var html = '<p>GTI: <span class="'+gtiLabelClass+'">'+ data.gti+ '</span></p>';
            html += '<p>norse: <span class="'+norseLabelClass+'">'+ data.norse+ '</span></p>';

            Utils.showTooltip(html,e.clientX, e.clientY);
        }        
    }
}

function onShieldMouseOut(e){
    Utils.hideTooltip();
}

function onGlobeMouseOver(sconnect_type){
    return function(e){
        if(sconnect_type == 'NETFLOW'){
            var data = e.currentTarget.dataset;
            var geoLocation = data.geo.replace(/;/g, ", ");
            var domain = data.domain;

            var html = '<p>Geo Location: <strong>'+geoLocation+'</strong></p>';
            html += '<p>Domain: <strong>'+domain+'</strong></p>'

            Utils.showTooltip(html,e.clientX, e.clientY);
        }
    }
}

function onGlobeMouseOut(e){
    Utils.hideTooltip();
}

var SconnectsScores = React.createClass({       
    mixins: [History],
    render: function(){
        var columns = AppConstants.SCORES_COLUMNS;
        var dataType = this.props.data.type;
        if(this.props.routeParams.type != undefined && this.props.routeParams.type == 'dns')
            columns = AppConstants.DNS_SCORES_COLUMNS;

        return (
                               
        <table className="table table-intel table-intel-striped table-hover" style={{fontSize: 'small'}}>
            <thead>
                <tr>
                    {this.props.data.sconnects.length > 0 
                        ? (
                            Object.keys(this.props.data.sconnects[0]).map(function(value, i){ 
                                if(columns.indexOf(value) > -1)
                                    return (<th className="text-center" key={i}>{value}</th>);
                            }) 
                        )
                        : <th>Oops! looks like there's no data for this date.</th>
                    }
                </tr>
            </thead>
            <tbody>
                {this.props.data.sconnects.length > 0 
                    ? (
                        this.props.data.sconnects.map(function(value, i){   
                            if (+value.sev == 0){                                         
                            return (<tr key={value.srcIP+'-'+value.dstIP + i} onClick={onRowClick(dataType)} onMouseOver={onRowMouseOver(dataType)} onMouseOut={onRowMouseOut(dataType)}>
                                    {Object.keys(value).map(function(k){
                                        if(columns.indexOf(k) > -1){
                                            if(k.toLowerCase() == "srcip"){
                                                if (+value.srcIpInternal == 1){
                                                    return (<td className="text-center internal-ip" key={_.uniqueId('column_'+ k)}>{value[k]}</td>);
                                                }
                                                else{
                                                    return (<td className="text-center" key={_.uniqueId('column_'+ k)}>
                                                            {value[k]} 
                                                            <i className="fa fa-globe float-right ip-info" data-geo={value.srcGeo} data-domain={value.srcDomain} onMouseOver={onGlobeMouseOver(dataType)} onMouseOut={onGlobeMouseOut}></i>
                                                            <i className={ 'fa fa-shield float-right reputation ip-info ' + getRiskClass(value.gtiSrcRep, value.norseSrcRep)} 
                                                            data-gti={risks[value.gtiSrcRep]} data-norse={risks[value.norseSrcRep]} onMouseOver={onShieldMouseOver(dataType)} onMouseOut={onShieldMouseOut}></i>
                                                            </td>);
                                                }
                                            }
                                            else if(k.toLowerCase() =="dstip"){
                                                if (+value.destIpInternal == 1){
                                                    return (<td className="text-center internal-ip" key={_.uniqueId('column_'+ k)}>{value[k]}</td>);
                                                }
                                                else{
                                                    return (<td className="text-center" key={_.uniqueId('column_'+ k)}>
                                                            {value[k]} 
                                                            <i className={'fa fa-globe float-right ip-info'} data-geo={value.dstGeo} data-domain={value.dstDomain} onMouseOver={onGlobeMouseOver(dataType)} onMouseOut={onGlobeMouseOut}></i>
                                                            <i className={ 'fa fa-shield float-right reputation ip-info ' + getRiskClass(value.gtiDstRep, value.norseDstRep)} 
                                                            data-gti={risks[value.gtiDstRep]} data-norse={risks[value.norseDstRep]} onMouseOver={onShieldMouseOver(dataType)} onMouseOut={onShieldMouseOut}></i>
                                                            </td>);
                                                }
                                            }
                                            return (<td className="text-center" key={_.uniqueId('column_'+ k)}>{value[k]}</td>)
                                        }
                                    })                                                            
                                    }                                                       
                                </tr>);
                        }})

                    )
                    : <tr><td>Oops! looks like there's no data for this date.</td></tr>
                }
            </tbody>
        </table>
                                                
            );            
        
	},
    componentWillReceiveProps: function(nextProps){
        this.props.data.sconnects = nextProps.data.sconnects;
    }
    /*,

    getInitialState: function() {
       return SconnectsStore.getState();
    },

    componentWillMount: function(){
        SconnectsActions.getSconnects();
        this.setState(SconnectsStore.getState());
    },

    componentDidMount: function() {
        //SconnectsActions.getSconnects();
        SconnectsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SconnectsStore.removeChangeListener(this._onChange);        
    },

    _onChange: function() {
        this.setState(SconnectsStore.getState());
    }*/
});

module.exports = SconnectsScores;
