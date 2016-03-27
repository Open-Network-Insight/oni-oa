var React = require('react');
var Auth = require('../../utils/Auth');
var History = require('react-router').History;

var Logout = React.createClass({
	mixins: [History],

	render: function(){
		return (<div></div>);
	},

	componentDidMount: function(){
		Auth.logout(()=>{
			this.history.replaceState(null, '/login');
		});
	}
});

module.exports = Logout