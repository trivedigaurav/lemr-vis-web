'use strict';

(function(angular){

  var _template =  'templates/login.html';

  var app = angular.module('login', []);
  
  app.component('login',{
      
      restrict: 'E',
      bindings: {
        user: '=',
        submit: '&'
      },
      templateUrl: _template,
      controller: LoginController,
      controllerAs: 'login'
    });
  
  
  function LoginController(){
    
    this.$onInit = function(){
      // this.active = localStorage.getItem('activeEncounter') || "232369324";
      // this.changeEncounter();
    }
    
  }
  
})(window.angular);