'use strict';

(function(angular){

  var _template =  'templates/login.html';

  var app = angular.module('login', []);
  
  app.component('login',{
      
      restrict: 'E',
      bindings: {
        user: '=',
        session: '&'
      },
      templateUrl: _template,
      controller: ['backend', LoginController],
      controllerAs: 'login'
    });
  
  
  function LoginController(backend){
    var self = this;

    self.$onInit = function(){
         self.checkLogin();
    }

    self.checkLogin = function(manual) {
        backend.checkLogin()
            .then(function () {
                self.user = backend.getUserName();
                self.session();
            }, function() {
                if(manual) {
                    $("#login-box").addClass('has-error animated shake');
                }
                self.user = null;
            });
    }

    self.submit = function() {
          $("#login-box").removeClass('has-error animated shake');
          backend.login(self.username, self.password);
          self.checkLogin(true);
    }
    
  }


})(window.angular);