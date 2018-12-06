'use strict';

(function(angular){

  var _template =  'templates/encounter-select.html';

  var app = angular.module('encounter.select', []);
  
  app.component('encounterSelect',{
      
      restrict: 'E',
      bindings: {
        find: '&',
        active: '='
      },
      templateUrl: _template,
      controller: SelectController,
      controllerAs: 'esel'
    });
  
  
  function SelectController(){
    
    this.$onInit = function(){
      this.active = localStorage.getItem('activeEncounter') || "232369324";
      this.changeEncounter();
    }

    this.changeEncounter = function(){
      this.find();
      localStorage.setItem('activeEncounter', this.active);
    }
    
  }
  
})(window.angular);