(function() {
  var TBB;

  TBB = window.TBB = Ember.Application.create();

  require('scripts/components/*');

  require('scripts/helpers/*');

  require('scripts/controllers/*');

  require('scripts/store');

  require('scripts/models/*');

  require('scripts/routes/*');

  require('scripts/views/*');

  require('scripts/router');

}).call(this);
