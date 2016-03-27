var React = require('react');
var d3 = require('d3');
var SconnectsActions = require('../../actions/SconnectsActions');
require('../../lib/cubehelix.js');

var _sconnects = [];

var _topLevelDomains = [];

function createNetflowGraph(sconnects){
    _sconnects = sconnects;

    var activeEdge = $(".edge.active")[0];

    $('#scoresNetworkContainer > svg').remove();

    var nodes = sconnects.filter(function (d) {
        if ( d.sev == 0)
            return d;
    })
    .map(function (d) {
        return { name: d.srcIP, isInternal: +d.srcIpInternal, id: "n" + d.srcIP.replace(/\./g, "_") };
    })
    
    var nodes_2 = sconnects.filter(function (d) {
        if (d.sev == 0)
            return d;
    })
    .map(function (d) {
        return { name: d.dstIP, isInternal: +d.destIpInternal, id: "n" + d.dstIP.replace(/\./g, "_") };
    });

    nodes = getUniqueNodes(nodes.concat(nodes_2));

    // Get the edges from the data
    var edges = sconnects.filter(function (d) { if (d.sev == 0) return d; })
    .map(function (d, i) {
        var fSrc = nodes.map(function (n, i) { if (n.name == d.srcIP) return i }).filter(isFinite)
        var fDst = nodes.map(function (n, i) { if (n.name == d.dstIP) return i }).filter(isFinite)
        return {
            source: fSrc.length > 0 ? fSrc[0]: -1,
            target: fDst.length > 0 ? fDst[0]: -1,
            weight: -Math.log(d.lda_score),
            id: "k" + d.srcIP.replace(/\./g, "_") + "-" + d.dstIP.replace(/\./g, "_")
        };
    });

    // map the ip attr in the nodes
    //nodes = nodes.map(function (d) { return { ip: d }; });

    // small function to know if an edge is suspicious
    var edgeIsSuspect = function (d) { return d.weight > 13; };

    // Update the degree in the edges if the edge is a suspect
    edges.forEach(function (d) {
        if (edgeIsSuspect(d)) {
           nodes[d.source].degree = nodes[d.source].degree + 1 || 1;
           nodes[d.target].degree = nodes[d.target].degree + 1 || 1;
           
        }
    });

    // define an opacity function
    var opacity = d3.scale.threshold()
                    .domain([13])
                    .range([0.1, 1]);

    // Color for edges
    var color = d3.scale.cubehelix()
                    .domain([16, 13, 12, 2])
                    .range([d3.hsl(214, 0.04, 0.34), d3.hsl(216, 0.02, 0.59), d3.hsl(216, 0.69, 0.84), d3.hsl(201, 0.1, 0.72)]);

    // Color for nodes
    var nodeColor = d3.scale.ordinal()
                        .domain([10, 169, 172, 224, 239, 255])
                        .range([d3.rgb(237, 28, 36),
                                d3.rgb(237, 78, 36),
                                d3.rgb(237, 98, 36),
                                d3.rgb(237, 138, 36),
                                d3.rgb(237, 168, 36),
                                d3.rgb(237, 198, 36)]);            

    var linkStrength = d3.scale.threshold()
                         .domain([13])
                         .range([0.01, 1]);

    // Graph dimensions
    var margin = [20, 10, 10, 20],
    w = $("#scoresNetworkContainer").width(),
    h = $("#scoresNetworkContainer").height() - 10,
    size = [w, h],
    r = Math.round(w * 0.005); // 0.005 magic number for nodes styling purposes when expanding graph, radious is 0.5% of the #grap div

    //Main SVG container
    var svg = d3.select('#scoresNetworkContainer')
                .append('svg')
                .attr('width', w)
                .attr('height', h)
                .append('g');

    // Graph force
    var force = d3.layout.force()
                  .charge(-Math.round(h * 0.55)) // 0.55 is a magic number for graph styling purposes charge is 55% of the grap height
                  .linkDistance(Math.round(h * 0.081)) // 0.081 is a magic number for graph styling purposes linkDistance is 8.1% of the graph height
                  .gravity(.1)
                  .size(size)
                  .nodes(nodes)
                  .links(edges);

    // Group and append the edges to the main SVG
    svg.append('g')
       .selectAll('.edge')
       .data(edges.filter(edgeIsSuspect))
       .enter()
            .append('line')
            .classed('edge', true)
            .attr("id", function (d) { return d.id; })
            .style('stroke', function (d) { return color(d.weight); })
            .style('stroke-opacity', function (d) { return opacity(d.weight); });


    var edge = svg.selectAll('.edge');

    //Tooltip generator
    var tooltip = d3.select(".node-label");
                    
       
    var node = svg.append('g')
                 .selectAll('.node')
                 .data(nodes.filter(function (d) { return d.degree > 0; }))
                 .data(nodes)
                 .enter()
                   .append('path')
                   .classed('node', true)
                   .attr("id", function (d) { return "n" + d.name.replace(/\./g, "_"); })
                   .attr("d", d3.svg.symbol()
                        .size(function (d) { return (d.degree + r) * 20; })
                        .type(function (d) {
                            if (d.isInternal == 1)
                                return "diamond";
                            else
                                return "circle";
                        }))
                   .attr('fill', function (d) {
                       if (d.isInternal == 1)
                           return "#0071C5";
                       else
                           return "#fdb813";
                       //return nodeColor(+d.ip.split('.')[0]);
                   })
                   .call(force.drag)
                   .on('mouseover', function (d) {
                        tooltip.html(d.name + '<br/> <span class="x-small text-muted">Right click to apply IP filter</span>')
                               .style('visibility', 'visible');
                   })
                   .on('mousemove', function () {
                       if (($('body').width() - d3.event.pageX) < 130) {
                           tooltip.style('top', (d3.event.pageY - 10) + 'px')
                                  .style('left', (d3.event.pageX - 140) + 'px');
                       }
                       else {
                           tooltip.style('top', (d3.event.pageY - 10) + 'px')
                                  .style('left', (d3.event.pageX + 10) + 'px');
                       }
                   })
                   .on("contextmenu", function (d, i) {
                      d3.event.preventDefault();
                      var ipFilter = $('#ip_filter');
                      var btnApplyFilter = $('#btn_searchIp');
                      ipFilter.val(d.name);
                      btnApplyFilter.click();
                      tooltip.style('visibility', 'hidden'); 
                    })
                   .on('click', nodeClick)
                   .on('mouseout', function () { tooltip.style('visibility', 'hidden'); });
                   
    // set the tick event listener for the force
    force.on('tick', function () {

        edge.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });
        
        /*node.attr('cx', function (d) { return d.x = Math.max(r, Math.min(w - r, d.x)); })
            .attr('cy', function (d) { return d.y = Math.max(r, Math.min(h - r, d.y)); });
          */  
        node.attr('transform', function (d) {
            d.x = Math.max(r, Math.min(w - r, d.x));
            d.y = Math.max(r, Math.min(h - r, d.y));
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    });


    force.start();

    if(activeEdge){
        var selectedEdgeId = $(activeEdge).attr('id');

        blinkConnection(selectedEdgeId);
    }

}

function getDnsNodeName(fullName){
    var name = fullName.split(".").length <=2 ? fullName : "";

    if(name == ""){
        var tldIndex = -1;

        _topLevelDomains.forEach(function (d, i) {
            if (fullName.indexOf(d) > -1) {
                tldIndex = i;
                return;
            }                        
        });

        name = fullName.split('.').slice(tldIndex - 1, fullName.split('.').length).join('.');
    }

    return name;
}

function createDnsNetworkGraph(sconnects){
    _sconnects = sconnects;

    var activeEdge = $(".edge.active")[0];

    $('#scoresNetworkContainer > svg').remove();

    var nodes = sconnects.filter(function (d) {
        if ( +d.sev == 0)
            return d;
    })
    .map(function (d) {
        var _name = getDnsNodeName(d.dns_resp_name)
        return { name: _name, isInternal: 1, id: "n" + _name.replace(/\./g, "_") };
    })
    
    var nodes_2 = sconnects.filter(function (d) {
        if (+d.sev == 0)
            return d;
    })
    .map(function (d) {
        return { name: d.ip_dst, isInternal: 0, id: "n" + d.ip_dst.replace(/\./g, "_") };
    });

    nodes = getUniqueNodes(nodes.concat(nodes_2));

    // Get the edges from the data
    var edges = sconnects.filter(function (d) { if (d.sev == 0) return d; })
    .map(function (d, i) {
        var fSrc = nodes.map(function (n, i) { if (n.name == getDnsNodeName(d.dns_resp_name)) return i }).filter(isFinite)
        var fDst = nodes.map(function (n, i) { if (n.name == d.ip_dst) return i }).filter(isFinite)
        return {
            source: fSrc.length > 0 ? fSrc[0]: -1,
            target: fDst.length > 0 ? fDst[0]: -1,
            weight: -Math.log(d.lda_score),
            id: "k" + getDnsNodeName(d.dns_resp_name).replace(/\./g, "_") + "-" + d.ip_dst.replace(/\./g, "_")
        };
    });

    // map the ip attr in the nodes
    //nodes = nodes.map(function (d) { return { ip: d }; });

    // small function to know if an edge is suspicious
    var edgeIsSuspect = function (d) { return d.weight > 13; };

    // Update the degree in the edges if the edge is a suspect
    edges.forEach(function (d) {
        if (edgeIsSuspect(d)) {
           nodes[d.source].degree = nodes[d.source].degree + 1 || 1;
           nodes[d.target].degree = nodes[d.target].degree + 1 || 1;
           
        }
    });

    // define an opacity function
    var opacity = d3.scale.threshold()
                    .domain([13])
                    .range([0.1, 1]);

    // Color for edges
    var color = d3.scale.cubehelix()
                    .domain([16, 13, 12, 2])
                    .range([d3.hsl(214, 0.04, 0.34), d3.hsl(216, 0.02, 0.59), d3.hsl(216, 0.69, 0.84), d3.hsl(201, 0.1, 0.72)]);

    // Color for nodes
    var nodeColor = d3.scale.ordinal()
                        .domain([10, 169, 172, 224, 239, 255])
                        .range([d3.rgb(237, 28, 36),
                                d3.rgb(237, 78, 36),
                                d3.rgb(237, 98, 36),
                                d3.rgb(237, 138, 36),
                                d3.rgb(237, 168, 36),
                                d3.rgb(237, 198, 36)]);            

    var linkStrength = d3.scale.threshold()
                         .domain([13])
                         .range([0.01, 1]);

    // Graph dimensions
    var margin = [20, 10, 10, 20],
    w = $("#scoresNetworkContainer").width(),
    h = $("#scoresNetworkContainer").height() - 10,
    size = [w, h],
    r = Math.round(w * 0.005); // 0.005 magic number for nodes styling purposes when expanding graph, radious is 0.5% of the #grap div

    //Main SVG container
    var svg = d3.select('#scoresNetworkContainer')
                .append('svg')
                .attr('width', w)
                .attr('height', h)
                .append('g');

    // Graph force
    var force = d3.layout.force()
                  .charge(-Math.round(h * 0.45)) // 0.45 is a magic number for graph styling purposes charge is 55% of the grap height
                  .linkDistance(Math.round(h * 0.081)) // 0.081 is a magic number for graph styling purposes linkDistance is 8.1% of the graph height
                  .gravity(.1)
                  .size(size)
                  .nodes(nodes)
                  .links(edges);

    // Group and append the edges to the main SVG
    svg.append('g')
       .selectAll('.edge')
       .data(edges.filter(edgeIsSuspect))
       .enter()
            .append('line')
            .classed('edge', true)
            .attr("id", function (d) { return d.id; })
            .style('stroke', function (d) { return color(d.weight); })
            .style('stroke-opacity', function (d) { return opacity(d.weight); });


    var edge = svg.selectAll('.edge');

    //Tooltip generator
    var tooltip = d3.select(".node-label");
                    
       
    var node = svg.append('g')
                 .selectAll('.node')
                 .data(nodes.filter(function (d) { return d.degree > 0; }))
                 .data(nodes)
                 .enter()
                   .append('path')
                   .classed('node', true)
                   .classed('dns-name', function (d) {
                        if (d.isInternal == 1)
                            return true;
                        return false;
                    })
                   .attr("id", function (d) { return "n" + d.name.replace(/\./g, "_"); })
                   .attr("d", d3.svg.symbol()
                        .size(function (d) {  
                            if (d.isInternal == 1 && d.name.length > 60)
                                return (d.degree + r) * 40;
                            return (d.degree + r) * 20; 
                        })
                        .type(function (d) {
                            if (d.isInternal == 1)
                                return "diamond";
                            else
                                return "circle";
                        }))
                   .attr('fill', function (d) {
                       if (d.isInternal == 1)
                           return "#0071C5";
                       else
                           return "#fdb813";
                       //return nodeColor(+d.ip.split('.')[0]);
                   })
                   .call(force.drag)
                   .on('mouseover', function (d) {
                      var html = d.name;

                      if (d.isInternal == 0) {
                          html += '<br/> <span class="x-small text-muted">Right click to apply IP filter</span>';
                      }
                      else {
                          html += '<br/> <span class="x-small text-muted">Right click to apply DNS filter</span>';
                      }

                      tooltip.html(html)
                            .style('visibility', 'visible');
                   })
                   .on('mousemove', function () {
                       if (($('body').width() - d3.event.pageX) < 130) {
                           tooltip.style('top', (d3.event.pageY - 10) + 'px')
                                  .style('left', (d3.event.pageX - 140) + 'px');
                       }
                       else {
                           tooltip.style('top', (d3.event.pageY - 10) + 'px')
                                  .style('left', (d3.event.pageX + 10) + 'px');
                       }
                   })
                   .on("contextmenu", function (d, i) {
                      d3.event.preventDefault();
                      var ipFilter = $('#ip_filter');
                      var btnApplyFilter = $('#btn_searchIp');
                      ipFilter.val(d.name);
                      btnApplyFilter.click();
                      tooltip.style('visibility', 'hidden'); 
                    })
                   //.on('click', nodeClick)
                   .on('mouseout', function () { tooltip.style('visibility', 'hidden'); });
    
    d3.selectAll('.edge')
        .classed('suspicious', function (d) {
          var suspicious = _sconnects.filter(function (item) {
              return item.ip_dst == nodes[d.target].name && item.dns_resp_name.indexOf(nodes[d.source].name) > -1 && item.dns_resp_name.length > 64;
          });

          if (suspicious.length > 0) {
              return true;
          }

          return false;
        })
        .style("stroke", function (d) {
          var suspicious = _sconnects.filter(function (item) {
              return item.ip_dst == nodes[d.target].name && item.dns_resp_name.indexOf(nodes[d.source].name) > -1 && item.dns_resp_name.length > 64;
          });

          if (suspicious.length > 0) {
              return '#ed1c24';
          }

          return color(d.weight);
        });

    // set the tick event listener for the force
    force.on('tick', function () {

        edge.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });
        
        /*node.attr('cx', function (d) { return d.x = Math.max(r, Math.min(w - r, d.x)); })
            .attr('cy', function (d) { return d.y = Math.max(r, Math.min(h - r, d.y)); });
          */  
        node.attr('transform', function (d) {
            d.x = Math.max(r, Math.min(w - r, d.x));
            d.y = Math.max(r, Math.min(h - r, d.y));
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    });


    force.start();

    if(activeEdge){
        var selectedEdgeId = $(activeEdge).attr('id');

        blinkConnection(selectedEdgeId);
    }

}


function blinkConnection(edgeId){
    var color = d3.scale.cubehelix()
                    .domain([16, 13, 12, 2])
                    .range([d3.hsl(214, 0.04, 0.34), d3.hsl(216, 0.02, 0.59), d3.hsl(216, 0.69, 0.84), d3.hsl(201, 0.1, 0.72)]);

    d3.selectAll("line.blink_me")
      .style("stroke", function(d){color(d.weight)});

    d3.selectAll(".blink_me").classed('blink_me', false);


    var selectedEdge = d3.select("#" + edgeId);

    if(selectedEdge[0][0] != null){
        selectedEdge.style("stroke", "#FDB813")
                   .style("stroke-opacity", "1")
                   .classed("blink_me", true)
                   .classed("active", true);
                   
        var parent = $("#" + selectedEdge.attr("id")).parent()

        var sourceIpNodeId = d3.select("#" + edgeId).data()[0].source.name.replace(/\./g, '_');
        var targetIpNodeId = d3.select("#" + edgeId).data()[0].target.name.replace(/\./g, '_');

        selectedEdge.remove();

        parent.append(selectedEdge[0]);

        d3.select("#n" + sourceIpNodeId)
        .classed("blink_me", true);

        d3.select("#n" + targetIpNodeId)
          .classed("blink_me", true);
  }
}

function highlightEdge(id) {
    d3.selectAll(".edge").classed("edge-faded", true);

    d3.selectAll(".node").classed("node-faded", true);

    d3.select("#" + id)
        .style("stroke", "#FDB813")
        .style("stroke-opacity", "1");

    d3.select("#" + id).classed("edge-faded", false);

    var sourceIpNode = "n" + d3.select("#" + id).data()[0].source.name.replace(/\./g, "_");
    var targetIpNode = "n" + d3.select("#" + id).data()[0].target.name.replace(/\./g, "_");

    d3.select("#" + sourceIpNode).classed("node-faded", false);
    d3.select("#" + targetIpNode).classed("node-faded", false);
}

function recoverChart(selectedEdge){
   
    var color = d3.scale.cubehelix()
                .domain([16, 13, 12, 2])
                .range([d3.hsl(214, 0.04, 0.34), d3.hsl(216, 0.02, 0.59), d3.hsl(216, 0.69, 0.84), d3.hsl(201, 0.1, 0.72)]);
    var opacity = d3.scale.threshold()
                    .domain([13])
                    .range([0.1, 1]);  

    d3.selectAll(".edge")
      .style("stroke", function(d){return color(d.weight);})
      .style("stroke-opacity", function(d){return opacity(d.weight);})
      .classed("edge-faded", false)
      .classed("active", false)
      .classed("blink_me", false);  

    d3.selectAll(".node").classed("node-faded", false);      

    if(selectedEdge){
        var selected = d3.select("#" + selectedEdge)
            .style("stroke", "#FDB813")
            .style("stroke-opacity", 1)        
            .classed("active", true)
            .classed("blink_me", true);         
    }
}

function nodeClick(d) {
    var timestamp = $("#date_picker").val() == '' ? '2015-04-17' : $('#date_picker').val();
    SconnectsActions.getChordData(timestamp, d.name);
}

$(function(){
    $(window).resize(function () {          
        createNetflowGraph(_sconnects);
    });
});


function getUniqueNodes(nodes) {
    var a = [];

    for (var i = 0, j = nodes.length; i < j; i++) {
        if (a.filter(function (n) {return n.name == nodes[i].name }).length == 0) {
            a.push(nodes[i]);
        }
    }

    return a;
}

var SconnectsNetwork = React.createClass({
	
  statics: {
    forceRender: function(type){    
      if(type != undefined && type == 'dns'){
          createDnsNetworkGraph(_sconnects);
      }
      else{
          createNetflowGraph(_sconnects);
      }      
    },
    selectConnection: function(srcip, dstip){
        var edgeId = "k" + srcip.replace(/\./g,'_') + '-' + dstip.replace(/\./g,'_');
        blinkConnection(edgeId);
    },
    fadeNetworkChart: function (srcip, dstip){
        var edgeId = "k" + srcip.replace(/\./g,'_') + '-' + dstip.replace(/\./g,'_');
        highlightEdge(edgeId);
    },
    recoverNetworkChart: function(selectedEdge){        
        recoverChart(selectedEdge);          
    }
  },

  render:function(){

		return(
			 <div className="col-md-12 padding0" id="scoresNetworkContainer">

			 </div>
			)
	},

  componentWillReceiveProps: function(nextProps){      
    if(nextProps.routeParams.type != undefined && nextProps.routeParams.type == 'dns'){
      createDnsNetworkGraph(nextProps.data.sconnects);
    }
    else{
      createNetflowGraph(nextProps.data.sconnects);
    }
  },

	componentDidMount: function(){    
		if(this.props.routeParams.type != undefined && this.props.routeParams.type == 'dns'){      
      createDnsNetworkGraph(this.props.data.sconnects);
    }
    else{
      createNetflowGraph(this.props.data.sconnects);
    }
	}

});

module.exports = SconnectsNetwork;