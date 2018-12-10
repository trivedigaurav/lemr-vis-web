'use strict';

(function(angular){

  var _template =  'login/template.html';

  var app = angular.module('login', []);
  
  app.component('login',{
      
      restrict: 'E',
      bindings: {
        user: '=',
        load: '&'
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
                backend.putLogEvent("startSession", self.user);
                self.load();
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