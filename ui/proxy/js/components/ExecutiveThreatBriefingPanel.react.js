var $ = require('jquery');
var React = require('react');

var StoryboardActions = require('../../../js/actions/StoryboardActions');
var CommentsStore = require('../stores/CommentsStore');

var ExecutiveThreatBriefingPanel = React.createClass({
  getInitialState: function ()
  {
    return {loading: true};
  },
  componentDidMount: function ()
  {
    CommentsStore.addChangeDataListener(this._onChange);
  },
  componentWillUmount: function ()
  {
    CommentsStore.removeChangeDataListener(this._onChange);
  },
  render: function ()
  {
    var content, titles, summaries;

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
      titles = [];
      summaries = []

      this.state.data.forEach(function (comment, i)
      {
        var title, summary;

        title = comment.title || '';
        titles.push(
          <button key={'comment_' + i + '_title'} type="button" className="btn btn-default btn-sm" onClick={function (e) { e.preventDefault(); this._onSelect(comment, i); }.bind(this)}>
            {title}
          </button>
        );

        summary = comment.summary || '';
        summaries.push(
          <div key={'comment_' + i + '_summary'} id={'comment_' + i + '_summary'} className="row comment_summary" style={{display: "none"}}>
            <div key={'comment_' + i + '_summary_col'} className="col-md-12">
              <pre key={'comment_' + i + '_summary_content'}>
                {summary.replace(/\\n/g, '\n')}
              </pre>
            </div>
          </div>
        );
      }.bind(this));

      content = [
        <div key="comment_titles" className="row">
          <div key="comment_titles_col" id="incident_list" className="btn-group-vertical col-md-12" role="group" aria-label="Comments">
            {titles}
          </div>
        </div>,
        {summaries}
      ];
    }

    return (
      <div className="container-fluid">
        {content}
      </div>
    );
  },
  _onChange: function ()
  {
    this.setState(CommentsStore.getData());
  },
  _onSelect: function (comment, idx)
  {
    // Hide all visible comment symmary's
    $('.comment_summary:visible').hide();
    // Show comment symmary
    $('#comment_' + idx + '_summary').show();

    StoryboardActions.selectComment(comment);

    return false; // Prevent default event
  }
});

module.exports = ExecutiveThreatBriefingPanel;
