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
