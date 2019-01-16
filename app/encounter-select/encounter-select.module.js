'use strict';

(function(angular){

  var _template =  'encounter-select/encounter-select.template.html';

  var app = angular.module('encounter.select', []);
  
  app.component('encounterSelect',{
      
      restrict: 'E',
      bindings: {
        load: '&',
        selectEncounter: '='
      },
      templateUrl: _template,
      controller: SelectController,
      controllerAs: 'esel'
    });
  
  
  function SelectController(){
    var self = this;
    
    self.$onInit = function(){
      self.eid = localStorage.getItem('activeEncounter') || "232369324";
      self.selectEncounter = selectEncounter;
      selectEncounter();
    }

    function selectEncounter(eid){
      // console.log("changeEncounter", self.eid);
      if (eid){
        self.eid = eid;
      }
      
      self.load({encounter: self.eid});
      localStorage.setItem('activeEncounter', self.eid);
    }
    
  }
  
})(window.angular);