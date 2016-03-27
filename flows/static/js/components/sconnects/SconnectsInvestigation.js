var React = require('react');
var AppConstants = require('../../constants/AppConstants');
var SconnectsInvestigationStore = require('../../stores/SconnectsInvestigationStore');
var SconnectsActions = require('../../actions/SconnectsActions');

function onScoreBtnClick(e){
	var currentId = "#"+e.currentTarget.id
	$(currentId).removeClass('btn-default');
	$(currentId).addClass('btn-primary');
	$(currentId).addClass('active');

	$("#btnAssignScore").attr('disabled', false);

	$(".scoring:not("+currentId+")").removeClass('active');
	$(".scoring:not("+currentId+")").removeClass('btn-primary');
	$(".scoring:not("+currentId+")").addClass('btn-default');
}

function onFieldChange(e){
	var edgeDiv = $("#divEdgeInvestigation");
	var checkedCheckBoxes = edgeDiv.find("input[type='checkbox']:checked");
	var selectedValues = {srcIp: null, destIp: null, srcPort: null, destPort: null};
	if (checkedCheckBoxes.length > 0){
		$(".scoring").attr('disabled', false);		
	}
	else{
		$(".scoring").attr('disabled', true);	
		$("#btnAssignScore").attr('disabled', true);	
		$(".scoring").removeClass('active');
		$(".scoring").removeClass('btn-primary');
		$(".scoring").addClass('btn-default');
	}

	checkedCheckBoxes.toArray().forEach(function(item){
		switch($(item).attr('id')){
			case 'chkSrcIp':
				selectedValues.srcIp = true;
			break;

			case 'chkDstIp':
				selectedValues.destIp = true;
			break;

			case 'chkSport':
				selectedValues.srcPort = true;
			break;

			case 'chkDport':
				selectedValues.destPort = true;
			break;
		}		
	});

	SconnectsActions.changeScoreChkBox(selectedValues);
}


function assignBtnClick(e){
	var risk = $("button.scoring.active").data('risk');		
	SconnectsActions.commitScoring(SconnectsInvestigationStore.srcIp, SconnectsInvestigationStore.destIp
			, SconnectsInvestigationStore.srcPort, SconnectsInvestigationStore.destPort, risk);

	SconnectsInvestigation.resetCheckBoxes();
	SconnectsInvestigation.resetScoresButtons();
}

function runRulesClick(e){
	SconnectsActions.runScoringRules();
}

var SconnectsInvestigation = React.createClass({
	statics: {
		resetCheckBoxes: function(){
			var edgeDiv = $("#divEdgeInvestigation");
			var checkedCheckBoxes = edgeDiv.find("input[type='checkbox']:checked");
		        if (checkedCheckBoxes.length > 0){
		            $(checkedCheckBoxes).prop('checked', false);		            
		        }

			},
		resetScoresButtons: function(){
			$(".scoring").removeClass('active');
			$(".scoring").removeClass('btn-primary');
			$(".scoring").addClass('btn-default');
			$(".scoring").attr('disabled',true);
			$("#btnAssignScore").attr('disabled', true);
		}
	},
	render: function(){
		return(
				<div className="col-md-12" id="divEdgeInvestigation">
					<div className="row">
						<div className="col-md-12 text-center">
							<div className="btn-group btn-group-sm" role="group" aria-label="Small button group">
						    	<button type="button" className="btn btn-default" onClick={runRulesClick}>Run Rules</button>
						    	<button type="button" className="btn btn-default">Run Attack Heuristics</button>
						    	<button type="button" className="btn btn-default">Update Rules</button>
						    	<button type="button" className="btn btn-default">Update Heuristics</button>
	    					</div>
    					</div>
					</div>
					<div className="row top10">
						<div className="col-md-12 well well-sm">
							<div className="row">
								<div className="col-md-3"><label>Source IP:</label></div>
								<div className="col-md-3"><label>Dest IP:</label></div>
								<div className="col-md-3"><label>Source Port:</label></div>
								<div className="col-md-3"><label>Dest Port:</label></div>
							</div>
							{(()=>{
								if(this.state.connection){
									return (
											<div className="row">
												<div className="col-md-3">													
													<div className="checkbox">
														<label>
		      												<input type="checkbox" id="chkSrcIp" onChange={onFieldChange}/> {this.state.connection.srcip}
		      											</label>
		    										</div>
	    										</div>
	    										<div className="col-md-3">
		    										<div className="checkbox">
		    											<label>
		      												<input type="checkbox" id="chkDstIp" onChange={onFieldChange}/> {this.state.connection.dstip}
		      											</label>
		    										</div>
	    										</div>
	    										<div className="col-md-3">
		    										<div className="checkbox">	
		    											<label>	    										
		      												<input type="checkbox" id="chkSport" onChange={onFieldChange}/>{this.state.connection.sport} 
		      											</label>
		    										</div>
	    										</div>
	    										<div className="col-md-3">
		    										<div className="checkbox">
		    											<label>
		      												<input type="checkbox" id="chkDport" onChange={onFieldChange}/>{this.state.connection.dport}
		      											</label>
		    										</div>
	    										</div>
	    									</div>
										);
								}
								else{
									return (
										<div className="row">
											<div className="col-md-12">
												Select a row from the Suspicious Connects table
											</div>
										</div>
										);
								}
							})()}
						</div>
					</div>
					<div className="row">
						<div className="col-md-12 text-center">
							<div className="btn-group btn-group-sm" role="group" aria-label="Small button group">
						    	<button type="button" id="btnLow" onClick={onScoreBtnClick} className="btn btn-default scoring" data-risk="3">Low</button>
						    	<button type="button" id="btnMedium" onClick={onScoreBtnClick} className="btn btn-default scoring" data-risk="2">Medium</button>
						    	<button type="button" id="btnHigh" onClick={onScoreBtnClick} className="btn btn-default scoring" data-risk="1">High</button>
	    					</div>
    					</div>
    					<div className="col-md-12 top20 text-center">
							<button type="button" id="btnAssignScore" onClick={assignBtnClick} className="btn btn-primary">Assign Score</button>
    					</div>
					</div>
				</div>
			)
	},
	getInitialState: function() {
       return SconnectsInvestigationStore.getState();
    },

    componentWillMount: function(){        
        //this.setState(SconnectsInvestigationStore.getState());
    },

    componentDidMount: function() {
        //SconnectsActions.getSconnects();
        SconnectsInvestigationStore.addChangeListener(this._onChange);
        $(".scoring").attr('disabled', true);
        $("#btnAssignScore").attr('disabled', true);
    },

    componentWillUnmount: function() {
        SconnectsInvestigationStore.removeChangeListener(this._onChange);        
    },

    _onChange: function() {
        this.setState(SconnectsInvestigationStore.getState());
    }
	
});

module.exports = SconnectsInvestigation;