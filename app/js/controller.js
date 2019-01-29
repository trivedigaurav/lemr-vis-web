'use strict';

/* Main Controller */

angular.module('myApp.mainController', [])
  .controller('appCtrl', ['$scope', '$window', '$document', '$timeout', 
    '$rootScope', 'backend', 'truncateFilter', '$filter',
    function($scope, $window, $document, $timeout,
        $rootScope, backend, truncateFilter, $filter) {
        /*
         * Debug
         */

        $window.appCtrl = $scope;
        $scope.cacheBust = Date.now('U');

        /*
         * App config
         */

        $scope.levels = ["text", "sentence", "section", "report", "encounter"];

        $scope.active = {
            encounterId: null,
            encounterData: null, 
            username: null,
            // hl_index: -1,
            feedback: {
                // "encounters": {},
                // "reports": {},
                // "sections": {},
                // "sentences": {},
                // "texts": {},
                "list": []
            }
        };

        $scope.doLogout = function() {
            var confirm = true;

            if($scope.active.feedback.list.length > 0){
                confirm = $window.confirm("You have made unsaved changes. Would you still like to leave this page?");
            }

            if(confirm) {
                backend.putLogEvent("endSession", "OK");
                backend.logout();
                $scope.active.username = null;
                $window.location.reload(true);
            }
        }

        /*
         * Load reports
         */

        $scope.loadEncounter = function(encounter){

            if ($scope.active.feedback.list.length){
                $scope.retrainFeedback();
            }

            startLoading();

            if(encounter)
                $scope.active.encounterId = encounter;
            else
                $scope.active.encounterId = localStorage.getItem('activeEncounter');

            $scope.active.encounterData = null;

            backend.putLogEvent("loadEncounter", $scope.active.encounterId);

            backend.getEncounter($scope.active.encounterId).then(function(data) {
                $scope.active.encounterData = data;
                // $scope.active.hl_index = -1;
                stopLoading();                
            }, function() {
                backend.putLogEvent("loadEncounterFailed", $scope.active.encounterId);
                // showError("Unable to load reports");
                stopLoading();
            });
        }


       /*
        * Get Positives
        */
        $scope.getLevelsByReport = function(r_id){
            // console.log(r_id);

            let levels = {
                sentences: [],
                sections: []
            }

            if (!$scope.active.encounterData.reports[r_id])
                return levels

            //sentences
            for (let s_id of $scope.active.encounterData.reports[r_id].sentences){
                levels.sentences.push($scope.active.encounterData.sentences[s_id])
            }

            //sections
            for (let s_id of $scope.active.encounterData.reports[r_id].sections){
                levels.sections.push($scope.active.encounterData.sections[s_id])
            }

            return levels;
        }


        $scope.getBlurb = function(id, level){
            if (!$scope.active.encounterData)
                return

            level = level + "s";

            let start = $scope.active.encounterData[level][id].start;
            let end = $scope.active.encounterData[level][id].end;
            let report_id = $scope.active.encounterData[level][id].report_id;

            return $scope.active.encounterData.rads[report_id].text.slice(start,end)
        }

        /*
         * Feedback
         */

        $scope.showFeedbackMenu = null; //define in directive

        $scope.getLabel = function(type, id){
            
            if (!$scope.active.encounterData)
                return

            type = type + "s";

            if (type == "encounters")
                return $scope.active.encounterData.class == 1
            else if (type in $scope.active.encounterData)
                return $scope.active.encounterData[type][id].class == 1;
            else
                return false;

        }

        $scope.addFeedback = function(feedback){

            // console.log(feedback);

            backend.putLogEvent("addFeedbackToList", JSON.stringify(feedback));
            $scope.active.feedback.list.push(feedback);


            // for (let level of levels){
            //     if (feedback[level]){
            //         if (level == "text")
            //             $scope.active.feedback.texts[feedback["report"].id] = feedback.text.id;
            //         else
            //             $scope.active.feedback[level+"s"][feedback[level].id] = feedback[level].class;
            //     }
            // }
        }

        //TODO: Move this to report.directive
        //Using jquery here is not very clean
        function fixHighlights(level, id){

            let el = null;
            //TODO:!
            if (level == "encounter")
                return
            else if (level == "report")
                el = $("#"+level+"-"+id + " pre");
            else
                el = $("#"+level+"-"+id);

            let class_ = null;

            el.removeClass(level + "-feedback")
                        .removeClass(level + "-incidental");

            for (let feedback of $scope.active.feedback.list){
                if (feedback[level]){
                    if (feedback[level]["id"] == id)
                        class_ = feedback[level]["class"] == 1

                    el.addClass(level + "-feedback");
                }
            }
                            
            if (class_ == null)
                class_ = $scope.getLabel(level, id);

            if (class_){
                el.addClass(level + "-incidental");
            }

            console.log(level, id, class_);
        }

        $scope.removeFeedback = function(index) {

            // var hidden_id = $scope.active.feedback.list[index].$hidden_id;

            backend.putLogEvent("removeFeedback", JSON.stringify($scope.active.feedback.list[index]));

            var feedback = $scope.active.feedback.list.splice(index, 1)[0];

            for (let level of $scope.levels){
                if (feedback[level]){
                    switch(level){
                        case "text":
                            $(".highlight."+feedback["text"]["uid"]).contents().unwrap();
                            break;
                        case "sentence":
                            fixHighlights("sentence", feedback["sentence"]["id"]);
                            break;
                        case "section":
                            fixHighlights("section", feedback["section"]["id"]);
                            break;
                        case "report":
                            fixHighlights("report", feedback["report"]["id"]);
                            break;
                        case "encounter":
                            fixHighlights("encounter", feedback["encounter"]["id"]);
                            break;
                    }
                }
            }

            // $scope.active.feedbackList.forEach(function(feedback) {
            //     var i = feedback.conflictList.indexOf(hidden_id);
            //     if (i > -1) {
            //         feedback.conflictList.splice(i, 1);
            //     }
            // });
        }

        $scope.clearFeedback = function() {

            // var hidden_id = $scope.active.feedback.list[index].$hidden_id;

            backend.putLogEvent("clearFeedback", "");

            $scope.active.feedback.list = [];
        }

        $scope.sendFeedback = function(override) {

            if($scope.retraining == true){
                backend.putLogEvent("Error", "Re-training already in process!");    
                alert("Re-training already in process!");
            }
            else {
                setTimeout(function() {
                    $scope.retrainFeedback(override);
                    $scope.loadEncounter($scope.active.encounterId);
                });
            }

        }

        $scope.getFeedbackLink = function(index){
            let feedback = $scope.active.feedback.list[index];

            for (let level of $scope.levels){
                if (feedback[level]){
                    switch(level){
                        case "text":
                            return feedback["text"]["uid"];
                        case "sentence":
                            return "sentence-"+feedback[level].id;
                        case "section":
                            return "section-"+feedback[level].id;
                        case "report":
                            return "report-"+feedback[level].id;
                        // case "encounter":
                        //     return "Encounter #"+feedback[level].id;
                    }
                }
            }
        }

        $scope.getFeedbackBlurb = function(index){
            let feedback = $scope.active.feedback.list[index];

            for (let level of $scope.levels){
                if (feedback[level]){
                    switch(level){
                        case "text":
                            return feedback["text"].id;
                        case "sentence":
                            return $scope.getBlurb(feedback[level].id, level);
                        case "section":
                            return $scope.getBlurb(feedback[level].id, level);
                        case "report":
                            return "Report #"+feedback[level].id;
                        case "encounter":
                            return "Encounter #"+feedback[level].id;
                    }
                }
            }
        }

        $scope.getFeedbackClass = function(index){
            let feedback = $scope.active.feedback.list[index];
            for (let level of $scope.levels){
                if (feedback[level]){
                    if (level == "text")
                        return true;
                    else
                        return feedback[level]["class"] == 1; 
                }
            }
        }

        /*
        * Retraining
        */
        $scope.retraining = false;
        

        $scope.retrainFeedback = function(override=false) {
            // alert('Re-training!');
            if($scope.retraining == true)
                return;

            $scope.retraining = true;

            //assign ids to feedback list
            // for (var i=0; i < $scope.active.feedback.length; i++) {
            //     $scope.feedback.list[i].$hidden_id = i.toString();
            // }

            backend.putFeedback($scope.active.feedback.list, "current", override)
                .then(function(data) {
                    if(data.status == "OK"){
                        backend.putLogEvent("putFeedback", "OK");
                        $scope.clearFeedback();
                    }
                    else{
                        //TODO: Handle conflicts and warnings
                        backend.putLogEvent("Error", "Invalid response from putfeedback - " + data.status);
                        alert("Sorry, something went wrong. Please report this.");
                    }

                    $scope.retraining = false;

                }, function() { 
                    backend.putLogEvent("Error", "Unable to send feedback.");
                    alert("Unable to send feedback."); 
                    $scope.retraining = false;
                });
        };


        $window.onbeforeunload = function(event) {
            if($scope.active.feedback.list.length > 0) {
                return "You have made unsaved changes. \
                    Would you still like to leave this page?";
            }
        }

        /*
         * Helper Terms
         */
        $scope.search_list = ["tumor", "mass", "incidental", 
                        "nodule", "adenoma",
                        "cyst", "lesion", "aneurysm"];

        $scope.addTag = function(input){
            input = input.trim();

            if(input !== ''){
                //check if not already there

                backend.putLogEvent("addTag", input);

                if($scope.search_list.indexOf(input) === -1){
                    $scope.search_list.push(input);
                    $scope.insertTag = '';
                }
            }
        }
        
        $scope.closeTag = function(text){

            backend.putLogEvent("removeTag", text);

            $scope.search_list = $filter('filter')($scope.search_list, function(value){
                return value != text;
            });
        }
                    

        /*
         * Misc.
         */

        function showError (notice){
            $window.alert(notice)
        }

        // Loading
        $scope.loaderCount = 0;
        // $scope.appDisabled = true;

        function startLoading() {
            $scope.loaderCount += 1;
        }

        function stopLoading() {
            if ($scope.loaderCount > 1)
                $scope.loaderCount -= 1;
            else
                $scope.loaderCount = 0;
        }

        return true;
    }])
