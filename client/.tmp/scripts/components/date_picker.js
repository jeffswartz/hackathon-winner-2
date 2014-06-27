(function() {
  var hideDaysNotInMonth, highlightMeetings, highlightToday, removeActiveClass;

  TBB.DatePickerComponent = Ember.Component.extend({
    didInsertElement: function(params) {
      var datepicker, daysOfWeekDisabled,
        _this = this;
      if (this.enablePicking) {
        daysOfWeekDisabled = null;
      } else {
        daysOfWeekDisabled = "0,1,2,3,4,5,6";
      }
      datepicker = this.$('.date-picker').datepicker({
        keyboardNavigation: false,
        daysOfWeekDisabled: daysOfWeekDisabled
      });
      highlightMeetings(this.meetings);
      datepicker.on('changeMonth', function() {
        return setTimeout((function() {
          return highlightMeetings(_this.meetings, _this.ignoreToday);
        }), 50);
      });
      return datepicker.on('click', function() {
        return setTimeout((function() {
          return highlightMeetings(_this.meetings, true);
        }), 1);
      });
    },
    observeMeetings: (function() {
      return highlightMeetings(this.meetings, this.ignoreToday);
    }).observes('meetings.@each')
  });

  highlightMeetings = function(meetings, ignoreToday) {
    hideDaysNotInMonth();
    if (!ignoreToday) {
      highlightToday();
    }
    return meetings.forEach(function(meeting) {
      var meetingDay, monthYear;
      monthYear = moment(meeting.time).format('MMMM YYYY');
      if (monthYear === $($('.datepicker-switch')[0]).text()) {
        meetingDay = moment(meeting.time).format('DD');
        return $(".day:not(.new):not(.old)").each(function(i, calendarDay) {
          if ($(calendarDay).text() === meetingDay) {
            return $(calendarDay).addClass('meeting');
          }
        });
      }
    });
  };

  removeActiveClass = function() {
    return $('.datepicker .active').removeClass('active');
  };

  hideDaysNotInMonth = function() {};

  highlightToday = function() {
    var meetingDay, monthYear;
    monthYear = moment().format('MMMM YYYY');
    if (monthYear === $($('.datepicker-switch')[0]).text()) {
      meetingDay = moment().format('DD');
      return $(".day:not(.new):not(.old)").each(function(i, calendarDay) {
        if (parseInt($(calendarDay).text()) === parseInt(meetingDay)) {
          return $(calendarDay).addClass('active');
        }
      });
    }
  };

}).call(this);
