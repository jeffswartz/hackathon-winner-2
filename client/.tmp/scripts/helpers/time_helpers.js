(function() {
  Ember.Handlebars.helper('monthDateYear', function(value, options) {
    return moment(value).format('MMMM DD, YYYY');
  });

  Ember.Handlebars.helper('hourMinuteSecond', function(value, options) {
    return moment(value).format('hh:mm:ss a');
  });

  Ember.Handlebars.helper('dayTime', function(value, options) {
    return moment(value).format('MM/DD/YYYY, hh:mma');
  });

  Ember.Handlebars.helper('minutes', function(value, options) {
    return moment(value).format('mm:ss') + ' min';
  });

  Ember.Handlebars.helper('highlight', function(value, options) {
    var escaped;
    escaped = Handlebars.Utils.escapeExpression(value);
    return new Handlebars.SafeString('<span class="highlight">' + escaped + '</span>');
  });

  Ember.Handlebars.helper('meetingTime', function(value, options) {
    if (moment(value).isSame(+new Date(), 'day')) {
      return value = 'Today, ' + moment(value).format('hh:mm') + ' PST';
    } else {
      return moment(value).format('MM/DD/YY');
    }
  });

}).call(this);
