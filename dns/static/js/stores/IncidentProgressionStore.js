var assign = require('object-assign');

var DnsDispatcher = require('../dispatchers/DnsDispatcher');
var DnsConstants = require('../constants/DnsConstants');
var RestStore = require('./RestStore');

var fields = ['title', 'summary'];
var filterName;

var IncidentProgressionStore = assign(new RestStore(DnsConstants.API_INCIDENT_PROGRESSION), {
    errorMessages: {
        404: 'Please choose a different date, no data has been found'
    },
    setDate: function (date)
    {
        this.setEndpoint(DnsConstants.API_INCIDENT_PROGRESSION + '/' + date.replace(/-/g, ''));
    },
    setFilter: function (name, value)
    {
        filterName = name;
        this.setRestFilter(name, value);
    },
    getFilterName: function ()
    {
        return filterName;
    },
    getFilterValue: function ()
    {
        return this.getRestFilter(filterName);
    },
    clearFilter: function ()
    {
       this.removeRestFilter(filterName);
    }
});

DnsDispatcher.register(function (action) {
    switch (action.actionType) {
        case DnsConstants.UPDATE_DATE:
            IncidentProgressionStore.setDate(action.date);

            break;
        case DnsConstants.SELECT_COMMENT:
            var comment, filterParts, key;

            IncidentProgressionStore.clearFilter();

            comment = action.comment;

            filterParts = [];

            for (key in comment)
            {
                // Skip comment fields
                if (fields.indexOf(key)>=0) continue;

                if (comment[key])
                {
                    IncidentProgressionStore.setFilter(key, comment[key]);

                    break;
                }
            }

            IncidentProgressionStore.reload();

            break;
    }
});

module.exports = IncidentProgressionStore;

