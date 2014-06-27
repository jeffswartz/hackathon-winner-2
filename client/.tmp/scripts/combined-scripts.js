(function() {
  var TBB;

  TBB = window.TBB = Ember.Application.create();


(function() {
  TBB.ChatWidgetComponent = Ember.Component.extend({
    yOffset: window.pageYOffset,
    setYOffset: function() {
      return this.set('yOffset', window.pageYOffset);
    },
    shouldChatStick: (function() {
      return this.get('yOffset') > 75;
    }).property('yOffset'),
    didInsertElement: function() {
      var createdArchive;
      $(window).on('scroll', $.proxy(this.setYOffset, this));
      OTCS.setStrings({
        "In the queue": "",
        "Approx wait": "",
        "$time mins": "Waiting For Advisor"
      });
      createdArchive = false;
      return $.get("https://otcsf.herokuapp.com/app/createCustomer", function(config) {
        var content$, otcs, pollArchive;
        content$ = $(".chat-widget");
        content$.html('');
        OT.Archive.prototype.destroy = function() {};
        otcs = OTCS.initCustomer(config.apiKey, config.sessionId, config.token, {
          showTextChat: false,
          element: $(".chat-widget")[0]
        });
        pollArchive = function() {
          return $.get("https://otcsf.herokuapp.com/is-archive-ready/" + config.customerId, function(result) {
            console.log("polling...");
            console.log(result);
            if (result && result.name) {
              if (!createdArchive) {
                createdArchive = true;
                OTCSF.addArchive({
                  title: result.name.split("#####")[0],
                  time: result.createdAt
                });
              }
              if (result.url && result.url.length > 10) {
                OTCSF.archiveReady({
                  url: result.url,
                  duration: result.duration * 1000
                });
                console.log("Archive is ready");
                return clearInterval(pollInterval);
              }
            }
          });
        };
        otcs.on("state", function(event) {
          var pollInterval;
          if (event.state === "connected") {
            return pollInterval = setInterval(pollArchive, 2000);
          }
        });
        otcs.sharedData.on("changed:meeting", function(newValue) {
          console.log("New Meeting from rep! Check console to view details");
          console.log(newValue);
          return OTCSF.showNewMeeting(newValue);
        });
        return otcs.sharedData.on("changed:sharedContent", function(newValue) {
          console.log("New Shared Content from rep!!!");
          console.log(newValue);
          return window.OTCSF.addSharedContent(newValue);
        });
      });
    }
  });

}).call(this);


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


(function() {
  TBB.RepChatWidgetComponent = Ember.Component.extend({
    didInsertElement: function() {
      var createdArchive, params, repName;
      createdArchive = false;
      params = window.location.href.split("?");
      repName = "Scott";
      if (params.length > 1) {
        repName = params[1];
      }
      return $.get("https://otcsf.herokuapp.com/app/createRep/" + repName, function(config) {
        var content$, pollArchive;
        content$ = $(".portfolio-review-image");
        content$.html('');
        OT.Archive.prototype.destroy = function() {};
        window.OTCSF.otcs = OTCS.initRep(config.apiKey, config.sessionId, config.token, {
          showTextChat: false,
          showInviteFlow: true,
          element: $(".portfolio-review-image")[0]
        });
        pollArchive = function() {
          var cid;
          console.log("polling archive, customer info");
          if (!window.OTCSF.otcs.customer || !window.OTCSF.otcs.customer.id) {
            return;
          }
          console.log(window.OTCSF.otcs.customer);
          console.log(window.OTCSF.otcs.customer.id);
          cid = window.OTCSF.otcs.customer.id;
          return $.get("https://otcsf.herokuapp.com/is-archive-ready/" + cid, function(result) {
            console.log("polling...");
            console.log(result);
            if (result && result.name) {
              if (!createdArchive) {
                createdArchive = true;
                OTCSF.addArchive({
                  title: result.name.split("#####")[0],
                  time: result.createdAt
                });
              }
              if (result.url && result.url.length > 10) {
                OTCSF.archiveReady({
                  url: result.url,
                  duration: result.duration * 1000
                });
                console.log("Archive is ready");
                return clearInterval(pollInterval);
              }
            }
          });
        };
        return window.OTCSF.otcs.on("state", function(event) {
          var pollInterval;
          if (event.state === "connected") {
            return pollInterval = setInterval(pollArchive, 2000);
          }
        });
      });
    }
  });

}).call(this);


(function() {
  TBB.SelectPickerComponent = Ember.Component.extend({
    didInsertElement: function(params) {
      return $('#' + this.selectId).selectpicker();
    }
  });

}).call(this);


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
        title: 'Portfolio Review 2013',
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
        return window.OTCSF.startChat(true);
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


(function() {
  var creditInfo, debtInfo, getRandomInt;

  TBB.ApplicationController = Em.ObjectController.extend({
    archiveVideoUrl: null,
    stocks: [
      {
        title: 'Dow',
        price: '15,821.63',
        change: '+70.96',
        percentage: '0.45%'
      }, {
        title: 'Nasdaq',
        price: '3,965.58',
        change: '+45.66',
        percentage: '1.16%'
      }, {
        title: 'S&P 500',
        price: '1,782.00',
        change: '+14.31',
        percentage: '0.81%'
      }
    ],
    actions: {
      showArchiveEntry: function(entry) {
        $('#myModal').modal('show');
        return this.set('archiveVideoUrl', entry.url);
      }
    },
    cashTransactions: (function() {
      var cashTransactions, currentCash, equity, fixed, lastCash, retirement,
        _this = this;
      currentCash = this.get('totalCash');
      lastCash = null;
      equity = 120000;
      fixed = 160000;
      retirement = 190000;
      return cashTransactions = [1, 2, 3, 4, 5].map(function(num, i) {
        var amount, date, debt, info;
        date = moment().subtract('days', i * i).format('MM/DD/YYYY');
        switch (i) {
          case 0:
            info = 'Check deposit #844';
            debt = false;
            amount = '1,543.50';
            currentCash = '127,559.33';
            date = '11/14/2013';
            break;
          case 1:
            info = 'VISA 1234';
            debt = true;
            amount = '2,457.87';
            currentCash = '126,015.83';
            date = '11/13/2013';
            break;
          case 2:
            info = 'Cash deposit ATM';
            debt = false;
            amount = '1,000.00';
            currentCash = '128,473.70';
            date = '11/10/2013';
            break;
          case 3:
            info = 'Withdrawal';
            debt = true;
            amount = '200.00';
            currentCash = '127,473.70';
            date = '11/05/2013';
            break;
          case 4:
            info = 'Check deposit #843';
            debt = false;
            amount = '2,150.00';
            currentCash = '127,673.70';
            date = '10/29/2013';
        }
        return {
          date: date,
          info: info,
          debt: debt,
          amount: amount,
          total: currentCash
        };
      });
    }).property(),
    equityTransactions: (function() {
      var transactions;
      return transactions = [
        {
          subtext: 'Reinvestment',
          info: 'Vanguard Russell 2000 ETF (VTWO)',
          date: '11/14/2013',
          debt: true,
          amount: '4,794.00',
          total: '141,112.96'
        }, {
          subtext: 'Dividend received',
          info: 'SPDR S&P 600 Small Cap ETF (SLY)',
          date: '11/13/2013',
          debt: false,
          amount: '6,335.00',
          total: '145,906.96'
        }, {
          subtext: 'Long-term cap gain',
          info: 'T. Rowe Price Institutional Large Cap Growth Fund (TRLGX)',
          date: '11/10/2013',
          debt: false,
          amount: '8,392.12',
          total: '139,571.96'
        }, {
          subtext: 'Long-term cap gain',
          info: 'Fidelity Focused Stock Fund (FTQGX)',
          date: '11/05/2013',
          debt: false,
          amount: '10,832.00',
          total: '131,179.84'
        }
      ];
    }).property(),
    fixedTransactions: (function() {
      var transactions;
      return transactions = [
        {
          info: 'Peritus High Yield ETF (HYLD)',
          date: '11/19/2013',
          debt: false,
          amount: '3,155.00',
          total: '164,832.31'
        }, {
          info: 'ProShares UltraPro Sht 20+ Yr Treas (TTT)',
          date: '11/14/2013',
          debt: false,
          amount: '8,765.10',
          total: '161,677.21'
        }, {
          info: 'Guggenhm BltShs 2015 HY Corp Bd ETF (BSJF)',
          date: '11/10/2013',
          debt: false,
          amount: '1,100.00',
          total: '152,912.21'
        }, {
          info: 'PIMCO 0-5 Year Hi Yield Corp Bd Idx (HYS)',
          date: '11/05/2013',
          debt: false,
          amount: '2,342.17',
          total: '151,812.21'
        }
      ];
    }).property(),
    retirementTransactions: (function() {
      var transactions;
      return transactions = [
        {
          info: 'TIAA-CREF Lifecycle Retirement Income Fund (TLRIX)'
        }, {
          info: 'Vanguard Target Retirement Income (VTINX)'
        }
      ];
    }).property()
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

}).call(this);


(function() {
  TBB.HomeController = Em.ObjectController.extend({
    needs: ['application'],
    password: 'abc1234',
    passwordError: false,
    email: 'ian@company.com',
    emailError: false,
    actions: {
      login: function() {
        var email, password;
        email = this.get('email');
        password = this.get('password');
        if (!email || !password) {
          if (!email) {
            $('#emailInputHolder').popover();
            $('#emailInputHolder').popover('show');
          } else {
            $('#emailInputHolder').popover('hide');
          }
          if (!password) {
            $('#passwordInputHolder').popover();
            $('#passwordInputHolder').popover('show');
            return console.log('no password');
          } else {
            return $('#passwordInputHolder').popover('hide');
          }
        } else {
          $('#emailInputHolder').popover('hide');
          $('#passwordInputHolder').popover('hide');
          return this.transitionToRoute('account');
        }
      }
    }
  });

}).call(this);


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
        title: 'Portfolio Review 2013',
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


(function() {
  TBB.Store = DS.Store.extend();

  TBB.ApplicationAdapter = DS.FixtureAdapter;

}).call(this);


(function() {
  TBB.AccountRoute = Em.Route.extend({
    model: function() {
      return {
        oneWeekAgo: moment().subtract('days', 7)
      };
    }
  });

  TBB.RepRoute = Em.Route.extend({
    model: function() {
      return {
        oneWeekAgo: moment().subtract('days', 7)
      };
    }
  });

}).call(this);


(function() {
  TBB.ApplicationView = Em.View.extend({
    didInsertElement: function() {
      var _this = this;
      console.log('insert element');
      this.$('.modal-table').on('click', function(e) {
        if (e.toElement.localName !== 'video') {
          $('#myModal').modal('hide');
          return $('#previewModalVideo')[0].pause();
        }
      });
      return $(window).resize(function() {
        return _this.$('.modal-table').height(window.innerHeight);
      });
    }
  });

}).call(this);


(function() {
  TBB.Router.map(function() {
    var startView;
    startView = /rep/g.exec(window.location.pathname) ? "rep" : "home";
    this.route(startView, {
      path: '/'
    });
    this.route('account', {
      path: '/account'
    });
    this.route('rep', {
      path: '/rep'
    });
    return this.route('about', {
      path: '/about'
    });
  });

}).call(this);


}).call(this);
