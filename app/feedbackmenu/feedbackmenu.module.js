'use strict';

(function(angular) {

    var _template = 'feedbackmenu/feedbackmenu.template.html';

    var app = angular.module('feedbackmenu', []);

    app.component('feedbackmenu', {

        restrict: 'E',
        bindings: {
            addFeedback: '&',
            getLabel: '&'
        },
        templateUrl: _template,
        controller: ['$scope', 'backend', feedbackmenuController],
        controllerAs: 'menu'
    });

    function feedbackmenuController($scope, backend) {
        var self = this;

        self.$onInit = function() {
            self.top = "200";
            self.left = "300";
            self.display = false;
            self.levels = ["encounter", "report", "section", "sentence", "text"];

            // for (level of self.levels){
            //   self[level+"Disabled"] = true;
            // }
        }

        //TODO: What's the properway to do this?
        $scope.$parent.$on("show-feedbackmenu", function(event, contextMenuObj) {
            createMenu(contextMenuObj);
            $scope.$apply();
        });

        function createMenu(contextMenuObj) {

            if (contextMenuObj.items) {

                let first = false;

                for (var i = self.levels.length - 1; i >= 0; --i) {

                    let level = self.levels[i];

                    if (level in contextMenuObj.items) {

                        self[level] = contextMenuObj.items[level];

                        if (level == "text"){
                            self.textIs = true;
                            continue;
                        }

                        self[level + "Is"] = self.getLabel({
                                type: level,
                                t_id: self[level]
                            });
                        
                        if (!first) {
                          self[level+"Is"] = !self[level+"Is"]
                          first = true;
                        }
                    } 
                    else {
                        self[level] = null;
                        self[level+"Is"] = false;
                    }
                }

                self.checkFeedback();

                self.top = contextMenuObj.event.pageY;
                self.left = contextMenuObj.event.pageX;

                self.display = true;
            } else {
                self.display = false;
            }
        }

        self.checkFeedback = function() {
            
            if(!self.text)
                self.textIs = false;
            else
                self.textIs = true;

            //check low to high
            let lowest = false;
            
            for (let i = self.levels.length; i >= 0; --i) {
                let level = self.levels[i];

                //enable all
                self[level+"Disabled"] = false;

                if (lowest){
                    self[level+"Is"] = true;
                }
                else{
                    if (self[level+"Is"])
                        lowest = true;    
                }
            }


            //check high to low
            let highest = true;

            for (let level of self.levels){
                if (highest) {
                    if (!self[level+"Is"])
                        highest = false;
                }
                else{
                    self[level+"Is"] = false;
                    self[level+"Disabled"] = true;
                }
            }
        }

        self.addFeedbackCallback = function() {

            let ret = {}

            for (let level of self.levels){
                if (self[level+"Is"])
                    ret[level] = self[level]
                else
                    ret[level] = null;
            }

            self.addFeedback({feedback: ret});
            self.display = false;
        }
    }


})(window.angular);