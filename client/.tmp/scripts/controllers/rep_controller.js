(function() {
  var quickSortTime;

  TBB.RepController = Em.ObjectController.extend({
    needs: ['application'],
    sharedContent: [
      Ember.Object.create({
        title: 'The U.Fund College Investing Plan Performance',
        graph: 'images/graph_1.png',
        isSelected: true,
        timeShared: moment().format('MMMM DD,YYYY, hh:mma') + ' PST'
      }), Ember.Object.create({
        title: 'UNIQUE College Investing Plan Performance',
        graph: 'images/graph_2.png',
        isSelected: false,
        timeShared: null
      })
    ],
    firstMeeting: (function() {
      return this.get('meetings')[0];
    }).property('meetings'),
    meetings: [
      {
        title: 'Portfolio Review',
        rep: {
          id: 'Scott',
          name: 'Scott'
        },
        time: moment('01:30pm', 'hh:mma'),
        isToday: true
      }, {
        title: 'Investment Tips Session',
        rep: {
          id: 'Scott',
          name: 'Scott'
        },
        time: 1392903000000
      }, {
        title: '401k Updates',
        rep: {
          id: 'Scott',
          name: 'Scott'
        },
        time: 1397482200000
      }
    ],
    archives: [
      {
        title: "401k Update",
        time: 1384416000000,
        url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
        duration: 1339000
      }, {
        title: "Portfolio Review",
        time: 1371043282000,
        url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
        duration: 754000
      }, {
        title: "Portfolio Updates",
        time: 1363849200000,
        url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
        duration: 552000
      }
    ],
    selectedFund: 0,
    selectedFundObserver: (function() {
      var selectedItem,
        _this = this;
      selectedItem = this.get('selectedFund');
      return this.get('sharedContent').forEach(function(item, i) {
        item.set('isSelected', i === selectedItem);
        return item;
      });
    }).observes('selectedFund'),
    selectedFundUrl: (function() {
      var index;
      index = this.get('selectedFund');
      return this.get('sharedContent')[index].graph;
    }).property('selectedFund'),
    selectedFundTitle: (function() {
      var index;
      index = this.get('selectedFund');
      return this.get('sharedContent')[index].title;
    }).property('selectedFund'),
    sharedFundIndex: 0,
    sharedFund: (function() {
      var index;
      index = this.get('sharedFundIndex');
      return this.get('sharedContent')[index];
    }).property('sharedFundIndex'),
    times: (function() {
      var times;
      times = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
      return times.map(function(num) {
        return moment().hour(num).format('ha');
      });
    }).property(),
    selectedTime: null,
    meetingTitle: null,
    isScheduleOpen: true,
    isPreviewSessionOpen: true,
    isAccountOverviewOpen: true,
    isRecommendedFundsOpen: true,
    setOTCSF: (function() {
      var _this = this;
      window.OTCSF = {};
      window.OTCSF.addAdvisors = function(advisorArray) {
        return console.log('adding advisors');
      };
      window.OTCSF.inviteAdvisor = function(advisor) {
        return console.log('inviting advisor ' + advisor);
      };
      window.OTCSF.sendSharedContent = function(contentModels) {
        if (window.OTCSF.otcs && window.OTCSF.otcs.sharedData) {
          console.log("sending data");
          window.OTCSF.otcs.sharedData.set('sharedContent', contentModels);
        }
        return console.log('models ready to be sent:', contentModels);
      };
      window.OTCSF.sendMeeting = function(meetingModel) {
        if (window.OTCSF.otcs && window.OTCSF.otcs.sharedData) {
          console.log("sending data");
          window.OTCSF.otcs.sharedData.set('meeting', meetingModel);
        }
        return console.log('meetings ready to be sent:', meetingModel);
      };
      window.OTCSF.addArchive = function(archive) {
        var archives;
        archives = _this.get('archives').toArray();
        archives.unshiftObject(archive);
        _this.set('archives', archives);
        return _this.set('archivePending', true);
      };
      return window.OTCSF.archiveReady = function(data) {
        var archives;
        archives = _this.get('archives').toArray();
        archives[0].url = data.url;
        archives[0].duration = data.duration;
        _this.set('archives', archives);
        return _this.set('archivePending', false);
      };
    }).observes('model'),
    archivePending: false,
    actions: {
      selectFund: function(index) {
        return this.set('selectedFund', index);
      },
      openScheduleContainer: function() {
        $('#scheduleContainer').collapse('show');
        return this.set('isScheduleOpen', true);
      },
      hideScheduleContainer: function() {
        $('#scheduleContainer').collapse('hide');
        return this.set('isScheduleOpen', false);
      },
      openPreviewSessions: function() {
        $('#previousSessionContainer').collapse('show');
        return this.set('isPreviewSessionOpen', true);
      },
      hidePreviewSessions: function() {
        $('#previousSessionContainer').collapse('hide');
        return this.set('isPreviewSessionOpen', false);
      },
      openAccountOverview: function() {
        $('#accountOverviewContainer').collapse('show');
        return this.set('isAccountOverviewOpen', true);
      },
      hideAccountOverview: function() {
        $('#accountOverviewContainer').collapse('hide');
        return this.set('isAccountOverviewOpen', false);
      },
      openRecommendedFunds: function() {
        $('#recommendedFundsContainer').collapse('show');
        return this.set('isRecommendedFundsOpen', true);
      },
      hideRecommendedFunds: function() {
        $('#recommendedFundsContainer').collapse('hide');
        return this.set('isRecommendedFundsOpen', false);
      },
      selectFund: function(index) {
        return this.set('selectedFund', index);
      },
      shareContent: function() {
        var selectedContent, sharedContent, time;
        selectedContent = this.get('selectedFund');
        this.set('sharedFundIndex', selectedContent);
        sharedContent = this.get('sharedFund');
        time = moment().format('MMMM DD,YYYY, hh:mma') + ' PST';
        sharedContent.set('timeShared', time);
        return window.OTCSF.sendSharedContent(selectedContent);
      },
      scheduleMeeting: function() {
        var combined, day, dayMonthYear, isMeetingToday, meeting, meetingTime, meetings, monthYear, selectedTime, sortedMeetings;
        day = $('td.active').text();
        monthYear = $('.datepicker-switch')[0].innerText;
        console.log(monthYear);
        if (!day) {
          dayMonthYear = moment().format('DDMMMYYYY');
        } else {
          dayMonthYear = day + moment(monthYear, 'MMMM YYYY').format('MMMYYYY');
        }
        console.log(dayMonthYear);
        isMeetingToday = dayMonthYear === moment().format('DDMMMYYYY');
        selectedTime = this.get('selectedTime');
        selectedTime = $('.time-picker .filter-option').text();
        combined = dayMonthYear + ' ' + selectedTime;
        meetingTime = +moment(combined, 'DDMMMYYYY,ha');
        meeting = {
          title: this.get('meetingTitle'),
          time: meetingTime,
          rep: {
            id: 'Ian',
            name: 'Ian Small'
          },
          isToday: isMeetingToday
        };
        meetings = this.get('meetings');
        meetings.pushObject(meeting);
        sortedMeetings = quickSortTime(meetings);
        this.set('meetings', sortedMeetings);
        return window.OTCSF.sendMeeting(meeting);
      }
    }
  });

  quickSortTime = function(arr) {
    var greater, head, i, lesser;
    if (arr.length === 0) {
      return [];
    }
    lesser = [];
    greater = [];
    head = arr[0];
    i = 1;
    while (i < arr.length) {
      if (arr[i].time < head.time) {
        greater.push(arr[i]);
      } else {
        lesser.push(arr[i]);
      }
      i++;
    }
    return quickSortTime(greater).concat(head, quickSortTime(lesser));
  };

}).call(this);
