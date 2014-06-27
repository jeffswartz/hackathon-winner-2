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
