var React = require('react');
var StoryBoardActions = require('../../../js/actions/StoryBoardActions');
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
                titles.push(
                    <button key={'comment_' + i + '_title'} type="button" className="btn btn-default btn-sm" onClick={function (e) { e.preventDefault(); this._onSelect(comment, i); }.bind(this)}>
                        {comment.title}
                    </button> 
                );

                summaries.push(  
                    <div key={'comment_summary_' + i} className="row">
                        <div className="col-md-12">
                          <pre id={'comment_' + i + '_summary'} key={'comment_' + i + '_summary'} className="comment_summary" style={{display: "none"}}>
                            {comment.summary.replace(/\\n/g, '\n')}
                          </pre>
                        </div>
                      </div>

                );
            }.bind(this));

             content = [
                <div key="comment_titles" className="row">
                  <div id="incident_list" className="btn-group-vertical col-md-12" role="group" aria-label="Comments">
                    {titles}
                  </div>
                </div>,
                {summaries}
              ];
        }

        return (
            <div>{content}</div>
        )
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

        StoryBoardActions.selectComment(comment);

        return false; // Prevent default event
    }
});

module.exports = ExecutiveThreatBriefingPanel;
