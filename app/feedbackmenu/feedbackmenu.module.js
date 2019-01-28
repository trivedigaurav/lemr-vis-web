'use strict';

(function(angular) {

    var _template = 'feedbackmenu/feedbackmenu.template.html';

    var app = angular.module('feedbackmenu', []);

    app.component('feedbackmenu', {

        restrict: 'E',
        bindings: {
            addFeedback: '&',
            getLabel: '&',
            showFeedbackMenu: '='
        },
        templateUrl: _template,
        controller: ['$scope', feedbackmenuController],
        controllerAs: 'menu'
    });

    function feedbackmenuController($scope) {
        var self = this;

        self.$onInit = function() {
            self.top = "200";
            self.left = "300";
            self.display = false;
            self.levels = ["sentence", "section", "report", "encounter"];

            self.showFeedbackMenu = showFeedbackMenu;

            // for (level of self.levels){
            //   self[level+"Disabled"] = true;
            // }
        }

        function showFeedbackMenu(event, items, callback) {                
            if (items) {
                self.callback = callback;

                if ("text" in items){
                    self.text = items.text;
                    self.report = items.report;
                    self.encounter = items.encounter;
                }
                else{

                    self.text = null;

                    let first = false;

                    for (let level of self.levels) {

                        if (level in items) {

                            self[level] = items[level];

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
                }

                self.checkFeedback();

                self.top = event.pageY;
                self.left = event.pageX;

                self.display = true;
            } 
            else {
                self.display = false;

                if(callback)
                    callback(null);
            }

        }

        self.checkFeedback = function() {
            //check low to high
            let lowest = false;
            
            for (let level of self.levels) {
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

            for (let i = self.levels.length - 1; i >= 0; i--){

                let level = self.levels[i];

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

        function generateUID(){
            return (Date.now().toString(36) + Math.random().toString(36).substr(2,5));
        }

        self.addFeedbackCallback = function() {
            let ret = {}

            if (self.text != null){
                for (let level of self.levels){
                    ret[level] = {
                        "id": self[level],
                        "class": 1,
                    }
                }

                ret["sentence"] = null;
                ret["section"] = null;

                ret ["text"] = {
                        "id": self.text.replace(new RegExp("\n", 'g'), "\r\n"),
                        "class": 1,
                        "uid": generateUID()
                    }

            }
            else{
                ret["text"] = null;
                for (let level of self.levels) {
                    if (self[level]){
                        
                        ret[level] = {
                            "id": self[level],
                            "class": (self[level+"Is"] ? 1 : 0)
                        }    
                    }
                    else{
                        ret[level] = null;
                    }
                }
            }

            self.display = false;
            self.addFeedback({feedback: ret});

            if(self.callback)
                self.callback(ret);
        }
    }


})(window.angular);