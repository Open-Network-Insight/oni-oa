var React = require('react');

var DendrogramStore = require('../stores/DendrogramStore');

function buildDendrogram (data, ipsrc)
{
  var width, heiight, cluster, diagonal, svg, root, nodes, leafNodes, node, links, link;

  // Build data tree structure

  root = {
    name: ipsrc,
    children: [],
    id:"root"
  };

  leafNodes = 0;
  data.forEach(function (d, i)
  {
    var childNode = {
      name: d.dns_qry_name,
      count: 0,
      children: [],
      id: "child_" + i
    };

    root.children.push(childNode);

    d.dns_a.forEach(function (answer, j)
    {
      childNode.count++;

      childNode.children.push({
        name: answer,
        id: 'child_' + i + '_answer_' + j
      });

      leafNodes++;
    });
  });

  // Substract scroll bar width
  width = $(this.getDOMNode().parentNode).width() - 20;
  height = 100 + leafNodes * 20; // Make sure last magic number is at least twice the font size

  cluster = d3.layout.cluster()
                              .size([height-100, width-300]);

  diagonal = d3.svg.diagonal()
                              .projection(function (d) {
                                return [d.y, d.x]
                              });

  // Remove any old dendrogram
  // TODO: Update diagram instead of remove node
  d3.select(this.getDOMNode()).select('svg').remove();

  svg = d3.select(this.getDOMNode()).append('svg')
                                            .attr('width', width)
                                            .attr('height', height)
                                    .append('g')
                                            .attr('transform', 'translate(100,50)');

  // Build Dendrogram

  nodes = cluster.nodes(root);
  links = cluster.links(nodes);

  link = svg.selectAll('.link')
                              .data(links)
                              .enter().append('path')
                                                    .attr('class', 'link')
                                                    .attr('d', diagonal)
                                                    .on("mouseover", function (d)
                                                    {
                                                      d3.select(this)
                                                                    .style("stroke-width", 2)
                                                                    .style("cursor", "pointer")
                                                                    .style("stroke", "#ED1C24");

                                                      d3.select("#" + d.source.id)
                                                                                  .style("fill", "#C4D600");
                                                                                  //.attr("r", 4.5 * 2);

                                                      d3.select("#" + d.target.id)
                                                                                  .style("fill", "#C4D600");
                                                                                  //.attr("r", 4.5 * 2);
                                                    })
                                                    .on("mouseout", function (d)
                                                    {
                                                      d3.select(this)
                                                                    .style("stroke-width", null)
                                                                    .style("cursor", null)
                                                                    .style("stroke", null);

                                                      d3.select("#" + d.source.id)
                                                                                 .style("fill", null);

                                                      d3.select("#" + d.target.id)
                                                                                  .style("fill", null);
                                                    });

  node = svg.selectAll('.node')
                              .data(nodes)
                              .enter().append('g')
                                                  .attr('class', 'node')
                                                  .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')'; });

  node.append('circle')
                      .attr('r', 4.5)
                      .attr("id", function (d) { return d.id;})
                      .on("mouseover", function (d)
                      {
                        d3.select(this)
                                      .style("cursor", "pointer")
                                      .style("fill", "#C4D600");
                      })
                      .on("mouseout", function (d)
                      {
                        d3.select(this)
                                      .style("cursor", null)
                                      .style("fill", null);
                      });

  node.append('text')
                    .attr('dx', function (d) { return d.depth===0 ? -10 : 10; })
                    .attr('dy', function (d) {
                      return d.depth===1 ? -8 : 3;
                    })
                    .style('text-anchor', function (d) { return d.depth===0 ? 'end' : 'start' })
                    .attr('fill', 'black')
                    .text(function (d) { return d.name; });
}

var DetailsDendrogramPanel = React.createClass({
  getInitialState: function ()
  {
    return {loading: true};
  },
  render:function()
  {
    var content;

    if (this.state.error)
    {
      content = this.state.error;
    }
    else if (this.state.loading)
    {
      content = (
        <div className="oni_loader">
            Loading <span className="spinner"></span>
        </div>
      );
    }
    else
    {
      content = '';
    }

    return (
      <div className="col-md-12 padding0 dendrogram">{content}</div>
    )
  },
  componentDidMount: function()
  {
    DendrogramStore.addChangeDataListener(this._onChange);
  },
  componentWillUnmount: function ()
  {
    DendrogramStore.removeChangeDataListener(this._onChange);
  },
  componentDidUpdate: function ()
  {
    if (!this.state.loading)
    {
      if (this.state.srcIp)
      {
        buildDendrogram.call(this, this.state.data, this.state.srcIp);
      }
      else
      {
        // No srcIp means that we need to remove any dendrogram leftover
        d3.select(this.getDOMNode()).select('svg').remove();
      }
    }
  },
  _onChange: function ()
  {
    var state = DendrogramStore.getData();

    state.srcIp = DendrogramStore.getSrcIp();

    // TODO: API must return answers as JSON array
    state.data.forEach(function (d)
    {
      d.dns_a = d.dns_a.split('|');
    });

    this.setState(state);
  }
});

module.exports = DetailsDendrogramPanel;
