var RouterModule = require('react-router');
var React = require('react');
//var DefaultRoute = Router.DefaultRoute;
var Router = RouterModule.Router;
var Link = RouterModule.Link;
var Route = RouterModule.Route;
var IndexRoute = RouterModule.IndexRoute;


var Nav = require('./components/layout/Nav');
var SconnectsMain = require('./components/sconnects/SconnectsMain');
var Login = require('./components/login/Login');
var Logout = require('./components/login/Logout');
var Auth = require('./utils/Auth');
var SconnectsActions = require ('./actions/SconnectsActions');


var App = React.createClass({

    getInitialState: function(){
        return {
            loggedIn: Auth.loggedIn()           
        };
    },

    updateAuth: function(loggedIn){
        this.setState({
            loggedIn: loggedIn            
        });
    },
    componentWillMount() {
        Auth.onChange = this.updateAuth;
        Auth.login();
    },
    render: function () {
        return (  
        <div id="wrapper">  	
          <Nav route = {this.props.route} routeParams={this.props.routeParams}/>
    	    <div className="container-fluid">   
                <div id="tooltip"></div>
                <div className="node-label"></div>
    	        <div className="row height-block">    	        	
                    {this.props.children}
    	        </div>
    	    </div>	    
    	</div>
        );
    }
});

function requireAuth(nextState, replaceState) {
  if (!Auth.loggedIn()){
    replaceState({ nextPathname: nextState.location.pathname }, '/login')
  }
  else{
    if($('#date_picker').length > 0){
        if(nextState.location.pathname == '/'){
            SconnectsActions.getSconnects($('#date_picker').val().replace(/-/g, ''))
        }
        else{
            SconnectsActions.getDnsSconnects($('#date_picker').val().replace(/-/g, ''))
        }
    }
  }
  
}

React.render((
        <Router>
            <Route path="/" component={App}>
                <IndexRoute component={SconnectsMain} onEnter={requireAuth}/>
                <Route path="login" component={Login}/>
                <Route path="logout" component={Logout}/>
                <Route path="sconnects/:type" component={SconnectsMain} onEnter={requireAuth}/>
            </Route>
        </Router>
    ), document.body);
/*
var routes = (
  <Route name="app" path="/" handler={App}>
    <Route path="login" name="login" handler={Login}/>
  	<DefaultRoute handler={SconnectsMain} onEnter={requireAuth}/>       
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
*/