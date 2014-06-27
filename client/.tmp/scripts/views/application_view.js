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
