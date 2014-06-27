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
