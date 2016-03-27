var React = require('react');

var DnsActions = require('../actions/DnsActions');
var OniUtils = require('../OniUtils');

var DateInput = React.createClass({
  getInitialState: function ()
  {
    return {date: OniUtils.getCurrentDate()};
  },
  componentDidMount: function ()
  {
    $(this.getDOMNode()).datepicker({
        format: "yyyy-mm-dd",
        autoclose: true
    })
    .on("changeDate", this._onChange);
  },
  componentWillUnmount: function ()
  {
    $(this.getDOMNode()).datepicker('remove');
  },
  render: function ()
  {
    return (
      <input id={this.props.id} placeholder="Data date" type="text" className="form-control form-control-xs" value={this.state.date} readOnly />
    );
  },
  _onChange: function (e)
  {
    var date = e.date;

    DnsActions.setDate(OniUtils.getDateString(date));
    this.props.onChange.call(this, e);
  }
});

module.exports = DateInput;
