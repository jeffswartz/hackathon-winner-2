(function() {
  var creditInfo, debtInfo, getRandomInt, quickSortTime;

  TBB.AccountController = Em.ObjectController.extend({
    needs: ['application'],
    sharedContent: [],
    isSharedContentOpen: true,
    firstMeeting: (function() {
      return this.get('meetings')[0];
    }).property('meetings'),
    meetings: [
      {
        title: 'Portfolio Review',
        rep: {
          id: 'Scott',
          name: 'Scott Small'
        },
        time: moment('01:30pm', 'hh:mma'),
        isToday: true
      }, {
        title: 'Investment Tips Session',
        rep: {
          id: 'Scott',
          name: 'Scott Small'
        },
        time: 1392903000000
      }, {
        title: '401k Updates',
        rep: {
          id: 'Scott',
          name: 'Scott Small'
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
    chat: false,
    showMeeting: (function() {
      var meeting;
      meeting = this.get('newMeeting');
      if (meeting) {
        return $('#meetingModal').modal('show');
      }
    }).observes('newMeeting'),
    actions: {
      startChat: function() {
        return window.startOTSession();
      },
      showSharedContent: function() {
        $('#sharedContent').collapse('show');
        return this.set('isSharedContentOpen', true);
      },
      hideSharedContent: function() {
        $('#sharedContent').collapse('hide');
        return this.set('isSharedContentOpen', false);
      }
    },
    setOTCSF: (function() {
      var _this = this;
      window.OTCSF = {};
      window.OTCSF.addSharedContent = function(contentModel) {
        var contentModels;
        contentModels = [
          {
            url: 'http://i.imgur.com/YrkHK2r.png'
          }
        ];
        if (contentModel === 0) {
          contentModels = [
            {
              title: 'The U.Fund College Investing Plan Performance',
              url: 'images/graph_1.png'
            }
          ];
        } else {
          contentModels = [
            {
              title: 'UNIQUE College Investing Plan Performance',
              url: 'images/graph_2.png'
            }
          ];
        }
        return _this.set('sharedContent', contentModels);
      };
      window.OTCSF.startChat = function(boolean) {
        return _this.set('chat', boolean);
      };
      window.OTCSF.showNewMeeting = function(meeting) {
        var meetings, sortedMeetings;
        if (moment(meeting.time).format('DDMMMYYYY') === moment().format('DDMMMYYYY')) {
          meeting.isToday = true;
        } else {
          meeting.isToday = false;
        }
        meetings = _this.get('meetings');
        meetings.pushObject(meeting);
        sortedMeetings = quickSortTime(meetings);
        _this.set('meetings', sortedMeetings);
        return _this.set('newMeeting', meeting);
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
    totalCash: '127,559.33',
    totalEquity: '141,112.96',
    totalFixed: '164,832.21',
    totalRetirement: '198,451.43'
  });

  getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  creditInfo = {
    address: ['Cash deposit ATM', 'Cash deposit teller'],
    num: ['Check deposit', 'Electronic transfer']
  };

  debtInfo = {
    address: ['Withdrawal ATM', 'Withdrawal Teller'],
    num: ['VISA', 'MasterCard']
  };

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
