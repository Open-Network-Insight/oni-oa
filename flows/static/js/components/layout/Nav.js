var React = require('react');
var ToolBar = require('./ToolBar');
var Auth = require('../../utils/Auth');
var Link = require('react-router').Link;
var History = require('react-router').History;
var RouteContext = require('react-router').RouteContext;

var Nav = React.createClass({
	mixins: [History],

	render: function(){
		return(
		<nav className="navbar navbar-inverse">
	        <div className="container-fluid">           
	            <div className="navbar-header">
	                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
	                    <span className="sr-only">Toggle navigation</span>
	                    <span className="icon-bar"></span>
	                    <span className="icon-bar"></span>
	                    <span className="icon-bar"></span>
	                </button>	                
	                <a className="navbar-brand" href="#">{ 'Threat Intelligence'}</a>
	            </div>            
	            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-2">
	                	                		                	
                	{(()=>{
                		if(Auth.loggedIn()){
                			return (	
                				<ul className="nav navbar-nav navbar-right">
	                				<li id="sconnectsNetflow"><Link to="/">Flow Suspicious Connects</Link></li>
	                				<li id="sconnectsDns"><Link to="/sconnects/dns">DNS Suspicious Connects</Link></li>                					                				
	                				<li className="dropdown">
	                					<a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
	                						{Auth.getUserName()} <i className="fa fa-chevron-down"></i>
	                					</a>
		                				<ul className="dropdown-menu" role="menu">		                					
		                					<li id="logout"><Link to="/logout">Log out</Link></li>
		                				</ul>
	                				</li>
                				</ul>
                				);
                		}
                		return(
                			<ul className="nav navbar-nav navbar-right">
                				<li id="login"><Link to="/login">Sign in</Link></li>
                			</ul>
                			);
                	})()}	                                     
	                
	            </div>
	        </div>
	        <ToolBar route={this.props.route} routeParams={this.props.routeParams}/>
    	</nav>
		);
	}
});

module.exports = Nav;