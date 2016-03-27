var AppConstants = require('../constants/AppConstants')

var Auth = {
	login(username, pass, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
      this.onChange(true)
      return
    }
    loginRequest(username, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token;
        localStorage.username = res.username;
        if (cb) cb(true);
        this.onChange(true);
      } else {
        if (cb) cb(false);
        this.onChange(false);
      }
    })
  },

  getToken() {
    return localStorage.token;
  },

  getUserName(){
    return localStorage.username;
  },

  logout(cb) {    
    if (cb) cb()
    logoutRequest();
    delete localStorage.token
    delete localStorage.username
    this.onChange(false)
  },

  loggedIn() {
    return !!localStorage.token
  },

  onChange() {}
}
function loginRequest(username, pass, cb) {    
    $.ajax({
        type: "POST",
        url: AppConstants.AUTH_API_LOGIN_URL,
        data: JSON.stringify({username: username, password: pass}),
        contentType:"application/json; charset=UTF-8",
        success: function(data){
            if(data != null && data != undefined){
                cb({
                    authenticated: true,
                    token: data.token,
                    username: data.username
                });
            }
            else{
                cb({ authenticated: false });
            }
        },
        error: function(error){
            cb({ authenticated: false });
        }

    });
    
}

function logoutRequest(cb){
    $.ajax({
        type: "GET",
        url: AppConstants.AUTH_API_LOGOUT_URL,                
        success: function(data){
            console.log(data);           
        },
        error: function(error){
            console.log(error);
        }

    });
}

module.exports = Auth;