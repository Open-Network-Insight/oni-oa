var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_DATA_EVENT = 'change_data';

var RestStore = function (endpoint) {
  this.setEndpoint(endpoint);
  this._filters = {};
  this._data = {loading: false, headers: [], data: [], error: undefined};
};

assign(RestStore.prototype, EventEmitter.prototype, {
  defaultErrorMessage: 'Oops, something went wrong!!',
  errorMessages: {},
  setRestFilter: function (name, value)
  {
    this._filters[name] = value;
  },
  getRestFilter: function (name)
  {
    return this._filters[name];
  },
  removeRestFilter: function (name)
  {
    delete this._filters[name];
  },
  setEndpoint: function (endpoint) {
    this.endpoint = endpoint;
  },
  resetData: function ()
  {
    this._data = {loading: false, headers: [], data: [], error: undefined};

    this.emitChangeData();
  },
  setData: function (data)
  {
    this._data = data;
    
    this.emitChangeData();
  },
  getData: function ()
  {
    return this._data;
  },
  emitChangeData: function ()
  {
    this.emit(CHANGE_DATA_EVENT);
  },
  addChangeDataListener: function (callback) {
    this.on(CHANGE_DATA_EVENT, callback);
  },
  removeChangeDataListener: function (callback) {
    this.removeListener(CHANGE_DATA_EVENT, callback);
  },
  reload: function ()
  {
    var usePost = Object.keys(this._filters).length>0;
    
    this.setData({loading: true, headers: [], data: [], error: undefined});
    
    $.ajax(this.endpoint, {
      method: usePost ? 'POST' : 'GET',
      context: this,
      contentType: 'application/json',
      data: usePost ? JSON.stringify(this._filters) : null,
      success: function (response) {
        this.setData({
          loading: false,
          headers: response.headers,
          data: response.data,
          error: undefined
        });
      },
      error: function (response)
      {
        this.setData({loading: true, headers: [], data: [], error: this.errorMessages[response.status] || this.defaultErrorMessage});
      }
    });
  }
});

module.exports = RestStore;
