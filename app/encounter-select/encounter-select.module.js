'use strict';

(function(angular){

  var _template =  'encounter-select/encounter-select.template.html';

  var app = angular.module('encounter.select', []);
  
  app.component('encounterSelect',{
      
      restrict: 'E',
      bindings: {
        load: '&',
        showNextEncounter: '='
      },
      templateUrl: _template,
      controller: ['backend', SelectController],
      controllerAs: 'esel'
    });
  
  
  function SelectController(backend){
    var self = this;
    
    self.$onInit = function(){

      self.enc_list = [];

      backend.getAnnotationMap()
        .then(function(data){
          self.map_annot = data;
          // console.log(self.map_annot);
        });

      backend.getEncounterList()
        .then(function(data){
          
          self.enc_list = data;

          let stored = localStorage.getItem('activeEncounter');

          if (self.enc_list.indexOf(stored) != -1)
            self.eid = stored;
          else{
            self.eid = self.enc_list[0].toString();
            localStorage.setItem('activeEncounter', self.eid);
          }
        });

      self.showNextEncounter = function(reverse) {
        let idx = self.enc_list.indexOf(self.eid);

        if (!reverse){
          if(idx < self.enc_list.length - 1)
            loadEncounter(self.enc_list[idx + 1]);
        }
        else{
          if(idx > 0)
            loadEncounter(self.enc_list[idx - 1]);
        }
      };
    }

    function loadEncounter(enc){
      self.eid = enc.toString();      
      localStorage.setItem('activeEncounter', self.eid);
      self.load({encounter: self.eid});
    }

    self.selectEncounter = function(){
      // console.log("changeEncounter", self.eid);
      if(self.eid == null)
        return
      loadEncounter(self.eid);
    }

    
    
  }
  
})(window.angular);