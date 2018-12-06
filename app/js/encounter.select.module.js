'use strict';

(function(angular){

  var _template =  'templates/encounter-select.html';

  var app = angular.module('encounter.select', []);
  
  app.component('encounterSelect',{
      
      restrict: 'E',
      bindings: {
        load: '&',
        active: '='
      },
      templateUrl: _template,
      controller: SelectController,
      controllerAs: 'esel'
    });
  
  
  function SelectController(){
    var self = this;
    
    self.$onInit = function(){
      self.active = localStorage.getItem('activeEncounter') || "232369324";
      self.changeEncounter();
    }

    self.changeEncounter = function(){
      console.log("changeEncounter called!")
      self.load();
      localStorage.setItem('activeEncounter', self.active);
    }
    
  }
  
})(window.angular);