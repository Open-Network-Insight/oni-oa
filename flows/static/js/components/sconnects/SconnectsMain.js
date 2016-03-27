var React = require('react');
var SconnectsScores = require('./SconnectsScores');
var SconnectsDetails = require('./SconnectsDetails');
var SconnectsNetwork = require('./SconnectsNetwork');
var SconnectsStore = require('../../stores/SconnectsStore');
var SconnectsActions = require('../../actions/SconnectsActions');
var SconnectsInvestigation = require('./SconnectsInvestigation');
var Spinner = require('../layout/Spinner');
var Alert = require('../layout/Alert');
var Auth = require('../../utils/Auth');
var History = require('react-router').History;

function toggleFrame(e, props){
    var target = e.currentTarget.dataset.target;
    var expanded = $(target).parent().hasClass('expanded');
    $(".section").not($(target)).toggleClass("hidden");
    $(".section").not($(target)).css('height' , '');
    $(".section").parent().not($(target).parent()).toggleClass("hidden");
    if(expanded){
        $(target).css('height','');        
        $(target).parent().addClass('col-md-6');
        $(target).parent().removeClass('col-md-12');
        $(target).parent().removeClass('expanded');
        $(e.currentTarget).removeClass('fa-compress');
        $(e.currentTarget).addClass('fa-expand');
    }
    else{
        $(target).css('height','100%');
        $(target).parent().addClass('col-md-12');
        $(target).parent().removeClass('col-md-6');        
        $(target).parent().addClass('expanded');
        $(e.currentTarget).addClass('fa-compress');
        $(e.currentTarget).removeClass('fa-expand');
    }
    if(target == '#netflow_diagram'){
        var type = window.location.hash.includes("dns") ? 'dns' : 'netflow';
        SconnectsNetwork.forceRender(type);
    }
    if(target == '#details' && $("#chordContainer").length > 0){
        SconnectsDetails.forceChordRender();
    }
}

var SconnectsMain = React.createClass({

    mixins: [History],

	render: function(){

        var token = Auth.getToken();
		return (		
                   
            <div className="col-md-12 padding0 height-block">{/*Main Content Colum-. In here we will be adding sub-columns to form the sections layout*/}
                {/*Rigth Column*/}
                <div className="col-md-6 padding2 height-block">
                    {/*LDA Scores DIV*/}
                    <div className="col-md-12 section padding2 sconnect-frame" id="lda_scores">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                <span className="panel-title">Suspicious Connects                                                                
                                    <button id="btnToggleLdaScores" onClick={toggleFrame} data-target="#lda_scores" className="btn btn-default btn-xs fa fa-expand pull-right margin-sides5"></button>
                                    <button id="btnReloadScores" data-target="#lda_scores" className="btn btn-default btn-xs fa fa-refresh pull-right"></button>
                                </span>
                            </div>
                            <div className="panel-body padding0">
                                <div className="col-md-8">
                                    {(()=>{
                                        if(this.props.routeParams.type && this.props.routeParams.type == "dns"){
                                            return (<p key='p_sconnects_desc'>DNS Suspicious connections are listed below in ranked order.  Mouse over a
                                             connection to highlight it in the connection graph on the right.  Click the connection to generate all the log details in the detail
                                             view.</p>                                          
                                            );
                                        }
                                        else{
                                            return (<p key='p_sconnects_desc'>Netflow Suspicious connections are listed below in ranked order.  Mouse over a
                                             connection to highlight it in the connection graph on the right.  Click the connection to generate all the log details in the detail
                                             view.
                                            <span className="internal-ip">Internal IP Addresses</span>
                                            </p>
                                            );
                                        }                                                                                

                                    })()}                                                                            
                                </div>
                                <div className="col-md-4 text-center">                                
                                    <div className="btn-group btn-group-sm top10" role="group" aria-label="Small button group">
                                        <button type="button" id="btnShowAll" className="btn btn-default " data-risk="3">All</button>
                                        <button type="button" id="btnShowMedium" className="btn btn-default " data-risk="2">Medium</button>
                                        <button type="button" id="btnShowHigh" className="btn btn-default " data-risk="1">High</button>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                             {(() => {
                                if (this.state.error){
                                    return <Alert type="danger" explanation="Oops! Looks like there is no data available."/>
                                }
                                else if (this.state.loading){
                                    return (<Spinner/>);
                                }
                                else{
                                    return (<SconnectsScores data={this.state} route={this.props.route} routeParams={this.props.routeParams}/>  );
                                }
                            })()}
                            </div>                                                        
                        </div>                   
                    </div>
                    <div className="col-md-12 section padding2 sconnect-frame" id="scoring">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                <span className="panel-title">Edge Investigation                                                                
                                    <button id="btnToggleScoring" onClick={toggleFrame} data-target="#scoring" className="btn btn-default btn-xs fa fa-expand pull-right margin-sides5"></button>                                    
                                </span>
                            </div>
                            <div className="panel-body">
                                <SconnectsInvestigation selectedConnection={this.state.selectedConnection} route={this.props.route} routeParams={this.props.routeParams}/>
                            </div>                            
                        </div>                   
                    </div>
                </div>
                {/*left Column*/}
                <div className="col-md-6 padding2 height-block">
                    {/*Netflow Graph DIV*/}
                    <div className="col-md-12 section padding2 sconnect-frame" id="netflow_diagram">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                <span className="panel-title">Network View :: Suspicious Connects
                                    <button id="btnToggleNetflowDiagram" onClick={toggleFrame} data-target="#netflow_diagram" className="btn btn-default btn-xs fa fa-expand pull-right margin-sides5"></button>
                                    <button id="btnReloadNetflowDiagram" data-target="#netflow_diagram" className="btn btn-default btn-xs fa fa-refresh pull-right"></button>
                                </span>
                            </div>
                            <div className="panel-body height-block padding0">
                                {(() => {

                                    if (this.state.error){
                                        return <Alert type="danger" explanation="Oops! Looks like there is no data available."/>
                                    }
                                    else if (this.state.loading){
                                        return (<Spinner/>);
                                    }
                                    else{
                                        return (<SconnectsNetwork data={this.state} type={this.props.params.type} route={this.props.route} routeParams={this.props.routeParams}/>);
                                    }

                                })()}       
                            </div>
                        </div>                            
                    </div>

                    <div className="col-md-12 section padding2 sconnect-frame" id="details">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                <span className="panel-title">Detail View :: Suspicious Connects
                                    <button id="btnToggleDetails" onClick={toggleFrame} data-target="#details" className="btn btn-default btn-xs fa fa-expand pull-right"></button>
                                </span>
                            </div>                                            
                            <SconnectsDetails/>                        
                        </div>

                                         
                    </div>
                </div>
            </div>
        
			);
	},

    getInitialState: function() {
       return SconnectsStore.getState();
    },

    componentWillMount: function(){
        if(this.props.params.type != null && this.props.params.type != undefined && this.props.params.type != ''){
            SconnectsActions.getDnsSconnects();
            SconnectsActions.getTopLevelDomains();
        }
        else{
            SconnectsActions.getSconnects();
        }
        this.setState(SconnectsStore.getState());
    },

    componentDidMount: function() {
        //SconnectsActions.getSconnects();
        SconnectsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SconnectsStore.removeChangeListener(this._onChange);        
    },
    
    /*componentDidUpdate:function(prevProps, prevState){
        console.log(prevProps);
    },
    */
    _onChange: function() {
        this.setState(SconnectsStore.getState());
    }
});

module.exports = SconnectsMain;