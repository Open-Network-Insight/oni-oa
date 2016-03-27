var React = require('react');
var SconnectsActions = require('../../actions/SconnectsActions');
var History = require('react-router').History;
var RouteContext = require('react-router').RouteContext;

function applyDatePicker(type){
    $("#date_picker").datepicker({
        format: "yyyy-mm-dd",
        autoclose: true        
    })
    .on('changeDate', function(){onDateChange(type, this)})    
    ;

    $('#date_picker').datepicker('setDate', '2015-04-17');
}

function onDateChange(type, datepicker){
    if(window.location.hash.indexOf('sconnects/dns')  > -1){
        SconnectsActions.getDnsSconnects(datepicker.value.replace(/-/g, ''));   
    }
    else{        
        SconnectsActions.getSconnects(datepicker.value.replace(/-/g, ''));
    }
}

function onIpfilterApplied(e){
    var ipFilter = $("#ip_filter").val();
    SconnectsActions.filterSconnects(ipFilter);
}

function resetIpFilter(e){
    $("#ip_filter").val('');
    SconnectsActions.filterSconnects('');
}

var ToolBar = React.createClass({
    mixins: [History],

	render: function(){        
		return (
		<div className="row bg-default text-right" id="collapse_box">
            {/*Tools Buttons*/}
            <div className="col-md-12 pd-top-btm5">
                <div className="col-md-12 form-inline">
                    <div className="form-group">                        
                        <label htmlFor="ip_filter" className="control-label">
                            {(() => {
                                if(window.location.hash.indexOf('sconnects/dns')  > -1){
                                    return "IP/DNS Filter:"
                                }
                                return "IP Filter";
                            })()}
                        </label>
                        {' '}
                        <div className="input-group">
                            <span className="input-group-btn">
                                <button className="btn btn-primary btn-xs tip" type="button" id="btn_searchIp" onClick={onIpfilterApplied} title="Enter an IP Address and click the search button to filter the results."><i className="fa fa-search"></i></button>
                            </span>
                            <input type="text" id="ip_filter" className="form-control form-control-xs" placeholder="0.0.0.0" />
                        </div>{/* /input-group */}
                        {' '}
                        <button className=" btn btn-default btn-xs tip" onClick={resetIpFilter} title="Reset IP filter" id="reset_ip_filter"><i className="fa fa-undo"></i></button>
                        {' '}
                        <label htmlFor="date_picker" className="control-label">Data Date:</label>
                        {' '}
                        <input placeholder="Data date" type="text" id="date_picker" className="form-control form-control-xs" />                       
                    </div>{/*/form-group*/}
                </div>
            </div>
            {/* /Tools Buttons*/}                       
        </div> 
       
        );
	},

    componentDidMount: function(){
        applyDatePicker(this.props.routeParams.type);
        $(".tip").tooltip({
            selector: '',
            placement: 'bottom',
            container: 'body'
        });
    }
});

module.exports = ToolBar;