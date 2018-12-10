'use strict';

(function(angular){

  var _template =  'encounter-select/template.html';

  var app = angular.module('encounter.select', []);
  
  app.component('encounterSelect',{
      
      restrict: 'E',
      bindings: {
        load: '&'
      },
      templateUrl: _template,
      controller: SelectController,
      controllerAs: 'esel'
    });
  
  
  function SelectController(){
    var self = this;
    
    self.$onInit = function(){
      self.eid = localStorage.getItem('activeEncounter') || "232369324";
      self.changeEncounter();
    }

    self.changeEncounter = function(){
      // console.log("changeEncounter", self.eid);
      self.load({encounter: self.eid});
      localStorage.setItem('activeEncounter', self.eid);
    }
    
  }
  
})(window.angular);