'use strict';

(function(angular){

  var _template =  'templates/tags.html';

  var app = angular.module('tags', ['ui.bootstrap']);
  
  app.component('searchTag',{
      
      restrict: 'E',
      bindings: {
        text: '@',
        close: '&'
      },
      templateUrl: _template,
      controller: TagController,
      controllerAs: 'tag'
    });
  
  
  function TagController(){
    var self = this;
    
    self.$onInit = function(){}
    
  }
  
})(window.angular);