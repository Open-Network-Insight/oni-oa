var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_DATA_EVENT = 'change_data';

function csv2json(csvData, useHeaders)
{
  var jsonData = {};

  jsonData.data = [];
  csvData.forEach(function (row, idx)
  {
    if (idx==0 && useHeaders)
    {
      jsonData.headers =  row;
    }
    else
    {
      jsondData.data.push(row);
    }
  });

  return jsonData;
}

var RestStore = function (endpoint) {
  this.setEndpoint(endpoint);
  this._filters = {};
  this._data = {loading: false, headers: [], data: [], error: undefined};
  this._parser = d3.csv;
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
    var url, name;

    this.setData({loading: true, headers: [], data: [], error: undefined});

    url = this.endpoint;

    for (name in this._filters)
    {
      url = url.replace('${'+name+'}', this._filters[name]);
    }
    url = url.replace(/:/g, '_') + '.csv';

    $.ajax(url, {
      method: 'GET',
      context: this,
      contentType: 'application/csv',
      success: function (response) {
        var csv, headers, tmp;

        csv = this._parser.parseRows(response);

        response = {};

        if (!this._skipHeaders)
        {
          headers = csv.shift();
          
          csv = csv.map(function (row)
          {
            var obj = {};

            headers.forEach(function (name, idx)
            {
              obj[name] = row[idx];
            });

            return obj;
          });

          tmp = headers;
          headers = {};
          tmp.forEach(function (name)
          {
            headers[name] = name;
          });
        }

        this.setData({
          loading: false,
          headers: headers,
          data: csv,
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
