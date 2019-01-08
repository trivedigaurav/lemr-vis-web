'use strict';

(function(angular){

  var _template =  'feedbackmenu/feedbackmenu.template.html';

  var app = angular.module('feedbackmenu', []);
  
  app.component('feedbackmenu',{
      
      restrict: 'E',
      bindings: {
        addFeedback: '&'
      },
      templateUrl: _template,
      controller: ['$scope', 'backend', feedbackmenuController],
      controllerAs: 'menu'
    });

  function feedbackmenuController($scope, backend){
    var self = this;
    self.$onInit = function(){
      self.top = "200";
      self.left = "300";
      self.display = false;
    }
    
    //TODO: What's the properway to do this?
    $scope.$parent.$on("show-feedbackmenu", function(event, contextMenuObj){
      $scope.$apply(function () { 
        createMenu(contextMenuObj);
      });

    });


    function setContextMenuPostion(event) {  
      let contextMenu = $("#feedbackmenu");

      var mousePosition = {};
      var menuPostion = {};
      var menuDimension = {};

      menuDimension.x = contextMenu.outerWidth();
      menuDimension.y = contextMenu.outerHeight();
      mousePosition.x = event.pageX;
      mousePosition.y = event.pageY;

      if (mousePosition.x + menuDimension.x > $(window).width() + $(window).scrollLeft()) {
          menuPostion.x = mousePosition.x - menuDimension.x;
      } else {
          menuPostion.x = mousePosition.x;
      }

      if (mousePosition.y + menuDimension.y > $(window).height() + $(window).scrollTop()) {
          menuPostion.y = mousePosition.y - menuDimension.y;
      } else {
          menuPostion.y = mousePosition.y;
      }

      return menuPostion;
    }

    function createMenu(contextMenuObj){
      console.log(contextMenuObj);

      if (contextMenuObj.items){
        let pos = setContextMenuPostion(contextMenuObj.event);
        self.top = pos.y;
        self.left = pos.x;

        self.display = true;
      }
      else{
        self.display = false;
      }

    }    
  }


})(window.angular);