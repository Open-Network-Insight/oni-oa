var React = require('react');

var ChartMixin = {
    propTypes: {
        className: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {
            className: 'oni-chart'
        };
    },
    componentDidUpdate: function (prevProps, prevState)
    {
        if (this.state.error) return;

        if (!this.state.loading) {
            if (prevState.loading) {
                this.buildChart();
            }

            this.state.data && this.draw();
        }
    },
    renderContent: function () {
        return (
            <div className={this.props.className}>
                <svg className="canvas"></svg>
            </div>
        );
    },
};

module.exports = ChartMixin;
