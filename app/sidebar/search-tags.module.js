'use strict';

(function(angular){

  var _template =  'sidebar/search-tags.template.html';

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
    var self = this;
    self.$onInit = function(){}
  }
  
})(window.angular);