var React = require('react');
var Auth = require('../../utils/Auth');
var History = require('react-router').History;

var Login = React.createClass({
	
	mixins: [History],

	getInitialState: function(){
		return {error:false};
	},

	handleSubmit: function(event){
		event.preventDefault();
		var username = $("#txtUserName").val();
		var password = $("#txtPassword").val();

		Auth.login(username, password, (loggedIn) => {
			if(!loggedIn){
				return this.setState({error:true});				
			}

			var location = this.props;

			if (location.state && location.state.nextPathname) {
		        this.history.replaceState(null, location.state.nextPathname)
		    } 
		    else {
		        this.history.replaceState(null, '/')
		    }
		
		});

	},
	render: function(){
		return (
		<div className="col-md-4 col-md-offset-4 top20">
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Sign in</h3>
				</div>
				<div className="panel-body">
					<form onSubmit={this.handleSubmit}>
						<div className="form-group">
							<label htmlFor="txtUserName">
								Username
							</label>
							<input className="form-control" type="text" id="txtUserName" placeholder="Username"/>						
						</div>
						<div className="form-group">
							<label htmlFor="txtPassword">
								Password
							</label>
							<input className="form-control" type="password" id="txtPassword" placeholder="Password"/>
						</div>
						<button type="submit" className="btn btn-default pull-right">Sign in</button>
					</form>

				</div>
			</div>
		</div>
		);
	}
});

module.exports = Login;