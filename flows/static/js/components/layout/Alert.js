var React = require('react');

var Alert = React.createClass({
	render: function(){
		var className = ['alert', 'alert-' + this.props.type].join(' '); 
		return(<div className={className} role="alert">
      		{this.props.explanation}
    	</div>);
	}
});

module.exports = Alert;