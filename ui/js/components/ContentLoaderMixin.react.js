var React = require('react');

var ContentLoaderMixin = {
    getInitialState: function () {
        return {};
    },
    renderError: function () {
        return (
            <div className="oni-content-loader">
                <span className="text-danger">{this.state.error}</span>
            </div>
        );
    },
    renderContentLoader: function () {
        return (
            <div className="oni-content-loader">
                <div className="oni_loader">
                    Loading <span className="spinner"></span>
                </div>
            </div>
        );
    },
    render: function () {
        var content;

        if (this.state.error) {
            content = this.renderError();
        }
        else if (this.state.loading) {
            content = this.renderContentLoader();
        }
        else {
            content = this.renderContent();
        }

        return content;
    }
};

module.exports = ContentLoaderMixin;
