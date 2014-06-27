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
