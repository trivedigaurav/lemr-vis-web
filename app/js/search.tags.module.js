'use strict';

(function(angular){

  var _template =  'templates/search-tags.html';

  var app = angular.module('search.tags', ['ui.bootstrap']);
  
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
    this.$onInit = function(){}
  }
  
})(window.angular);