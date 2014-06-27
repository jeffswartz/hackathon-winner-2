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
