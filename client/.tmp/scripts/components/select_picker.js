(function() {
  TBB.SelectPickerComponent = Ember.Component.extend({
    didInsertElement: function(params) {
      return $('#' + this.selectId).selectpicker();
    }
  });

}).call(this);
