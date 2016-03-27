var React = require('react');
var AppConstants = require('../../constants/AppConstants');
var SconnectsDetailsStore = require('../../stores/SconnectsDetailsStore');
var d3 = require('d3');
var _ = require('underscore');
var Alert = require('../layout/Alert');
var ChordMapper = require('../../lib/ChordMapper');

var _chordData = [];
var _ip = null;
/*Private functions*/

function drawChord(chordData, ip){
	_chordData = chordData;
	_ip = ip;
	var mpr = ChordMapper.chordMpr(_chordData);
	var numberFormat = d3.format(".3s");
	

    mpr.addValuesToMap('srcip')
       .addValuesToMap('dstip')
       .setFilter(function (row, a, b) {
          return (row.srcip === a.name && row.dstip === b.name)
       })
       .setAccessor(function (recs, a, b) {
          if (!recs[0]) {
              return 0;
          }
          return +recs[0].maxbyte;
       });
    var matrix = mpr.getMatrix()
    	,mMap = mpr.getMap();

     // generate chord layout
    var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending)
        .matrix(matrix);
    var rdr = ChordMapper.chordRdr(matrix, mMap);

    // Graph dimensions
    var width = $("#chordContainer").width(),
        height = $("#chordContainer").height(),
        innerRadius = Math.min(width, height) * .41, //.41 is a magic number for graph stilyng purposes
        outerRadius = innerRadius * 1.1; //1.1 is a magic number for graph stilyng purposes
    var fill = d3.scale.ordinal()
                .domain(d3.range(4))
                .range(["#F3D54E", "#00AEEF", "#C4D600", "#FC4C02", "#FFA300"]);

    var dragB = d3.behavior.drag()
            .on('drag', drag);

     //Clean the container div to re-draw the diagram
    d3.select("#chordContainer").html("")
        .style("overflow-y", "hidden");

    // Main SVG
    var svg = d3.select("#chordContainer").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .call(dragB);

    // Appending the chord paths
    var groups = svg.selectAll("g.group")
    	.data(chord.groups())
  	.enter().append("svg:g")
    	.attr("class", "group")                                    
        .on("mouseover", function (d, i) {

            var chord = svg.selectAll(".chord path").data().filter(function (d) { return (d.source.index == i || d.target.index == i);});

            d3.select("#tooltip")
            .style("visibility", "visible")
            .html(groupTip(rdr(d)) + chordTip(rdr(chord[0])))
            .style("top", $("#chordContainer").offset().top + 5 + "px")
            .style("left", $("#chordContainer").offset().left + 5 + "px");

            svg.selectAll(".chord path")
              .filter(function (d) { return d.source.index != i && d.target.index != i; })
            .transition()
              .style("opacity", 0.1);
        })
        .on("mouseout", function () {
            d3.select("#tooltip")
           .style("visibility", "hidden");

            fade(1)();
        });

    groups.append("svg:path")
       .style("stroke", "black")
       .style("fill", function (d) { return fill(d.index); })
       .style("cursor", "pointer")
       .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius));

    //grouping and appending the Chords
    svg.append("g")
        .attr("class", "chord")
      .selectAll("path")
        .data(chord.chords())
      .enter().append("path")
        .attr("d", d3.svg.chord().radius(innerRadius))
        .style("fill", function (d) { return fill(d.target.index); })
        .style("opacity", 1);        

   groups.append("svg:text")
       .each(function (d) { d.angle = (d.startAngle + d.endAngle) / 2; })
       .attr("dy", ".35em")       
       .style("font-size", "12px")
       .style("cursor", "pointer")
       .style("font-weight", function (d) {
           var _d = rdr(d);
           if (_d.gname == _ip) {
               return "900";
           }
           return "normal";
       })
       .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
       .attr("transform", function (d) {
           return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
               + "translate(" + (innerRadius * 1.15) + ")"
               + (d.angle > Math.PI ? "rotate(180)" : "");
       })
       .text(function (d) {
           var _d = rdr(d);
           if (_d.gvalue / _d.mtotal > 0.005 || _d.gname == _ip || matrix.length <= 10) {
               return _d.gname;
           }
       });

    // Returns an event handler for fading a given chord group.
    function fade(opacity, fnMouseover) {
        return function (d, i) {
            svg.selectAll(".chord path")
                .filter(function (d) { return d.source.index != i && d.target.index != i; })
              .transition()
                .style("opacity", opacity);
            if (fnMouseover) {
                fnMouseover();
            }
        };
    }
   
    function chordTip(d) {
        var p = d3.format(".4%"), q = d3.format(",.3r")
        return "<br/>Chord Info:<br/>"
          + numberFormat(d.svalue) + " avg bytes from IP: "
          + d.sname + " to IP: " + d.tname
          + (d.sname === d.tname ? "" : ("<br/>while...<br/>"
          + numberFormat(d.tvalue) + " avg bytes From IP: "
          + d.tname + " to IP: " + d.sname))
    }

    function groupTip(d) {
        var p = d3.format(".4%"), q = d3.format(",.3r")
        return "Group Info:<br/>"
            + d.gname + " : " + numberFormat(d.gvalue) + " Avg Bytes <br/>"
            + p(d.gvalue / d.mtotal) + " of Matrix Total (" + numberFormat(d.mtotal) + ")"
    }

    function drag() {
        var x1 = width / 2
            , y1 = height / 2
            , x2 = d3.event.x
            , y2 = d3.event.y;

        var newAngle = Math.atan2(y2 - y1, x2 - x1) / (Math.PI / 180);

        d3.select("#chordContainer > svg > g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(" + newAngle + ",0,0)");

    }
}


$(function(){
    $(window).resize(function () {   
        $('#chordContainer').html('');
        drawChord(_chordData, _ip);
    });
});

var SconnectsDetails = React.createClass({
	statics: {
	    forceChordRender: function(){
	      $('#chordContainer').html('');
	      drawChord(_chordData, _ip);
	    }
  	},
	render: function(){
		if (this.state.error){
			return (<Alert type="danger" explanation="Oops! something went wrong while trying to fetch the data."/>);
		}
		else{
						
			if(this.state.logExtracts.length > 0){
				return(					
					<LogExtracts data={this.state}/>
					);
			}
			else if (this.state.chordData.length > 0){
				return(
					<div className="panel-body height-block padding0">
                    	<Chord chordData={this.state.chordData} ip ={this.state.ip}/>            
                    </div>   					
					);
			}
			return(<LogExtracts data={this.state}/>);			
		}
	},

	  getInitialState: function() {
       return SconnectsDetailsStore.getState();
    },

    componentWillMount: function(){        
        this.setState(SconnectsDetailsStore.getState());
    },

    componentDidMount: function() {
        //SconnectsActions.getSconnects();
        SconnectsDetailsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SconnectsDetailsStore.removeChangeListener(this._onChange);        
    },

    _onChange: function() {
        this.setState(SconnectsDetailsStore.getState());
    }
});

var LogExtracts = React.createClass({
	render:function(){
		var columns = AppConstants.LOG_EXTRACTS_COLUMNS

		return(
			<div className="col-md-12" id="logExtracts">
				<table className="table table-intel table-intel-striped table-hover" style={{fontSize: 'small'}}>
					<thead>
						<tr>
							{columns.map(function(d,i){
								return (<th className="text-center" key={i}>{d}</th>);
							})}
						</tr>
					</thead>
					<tbody>

						{this.props.data.logExtracts.length > 0
							?(
								this.props.data.logExtracts.map(function(d,i){
									return(<tr key={'log_row' + i} >
											{Object.keys(d).map(function(k){
												if(columns.indexOf(k) > -1){
													return(<td className="text-center" key={_.uniqueId('column_'+ k)}>{d[k]}</td>)
												}
											})}
										</tr>	
										)
								})
							)
							:(
								<tr>
									<td colSpan={columns.length}>Oops! looks like there is no data for that connection.</td>
								</tr>
							)

						}
					</tbody>
				</table>
			</div>
			);
	},
});

var Chord = React.createClass({
	render: function(){
		return (
			<div className="col-md-12 padding0" id="chordContainer">

			</div>
			)
	},

	componentWillReceiveProps:function(nextProps){
	    $('#chordContainer').html('');
	    drawChord(nextProps.chordData, nextProps.ip);
  	},

	componentDidMount: function(){
		drawChord(this.props.chordData, this.props.ip);
	}
});

module.exports = SconnectsDetails;