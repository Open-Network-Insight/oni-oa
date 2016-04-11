var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');

var StoryBoardActions = {
    reloadComments: function ()
    {
        DnsDispatcher.dispatch({
            actionType: DnsConstants.RELOAD_COMMENTS
        });
    },
    selectComment: function (comment)
    {
        DnsDispatcher.dispatch({
            actionType: DnsConstants.SELECT_COMMENT,
            comment: comment
        });
    }
};

module.exports = StoryBoardActions;
