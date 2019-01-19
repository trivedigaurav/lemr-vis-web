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

        $scope.levels = ["text", "sentence", "section", "report", "encounter"];

        /*
         * App config
         */

        // $rootScope.config = Object();
        
        // $rootScope.config.classificationName = {
        //     "positive": "True",
        //     "negative": "False",
        //     "unclassified": "?"
        // };

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

            if($scope.active.feedbackList.length > 0){
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
            startLoading();

            if(encounter)
                $scope.active.encounterId = encounter;

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

        $scope.removeFeedback = function(index) {

            // var hidden_id = $scope.active.feedback.list[index].$hidden_id;

            backend.putLogEvent("removeFeedback", JSON.stringify($scope.active.feedback.list[index]));

            var feedback = $scope.active.feedback.list.splice(index, 1)[0];

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

            if($scope.retrainData.loading == true){
                backend.putLogEvent("Error", "Re-training already in process!");    
                alert("Re-training already in process!");
            }
            else {
                setTimeout(function() {
                    $scope.retrainFeedback(override);
                });
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

        /*
        * Retraining
        */


        $scope.retrainData = new Object();
        $scope.retrainData.message = null;
        $scope.retrainData.loading = false;
        $scope.retrainData.status = null;

        $scope.retrainFeedback = function(override=false) {
            // alert('Re-training!');
            if($scope.retrainData.loading == true)
                return;

            $scope.retrainData.loading = true;

            //assign ids to feedback list
            for (var i=0; i < $scope.active.feedback.length; i++) {
                $scope.feedback.list[i].$hidden_id = i.toString();
            }

            backend.putFeedback($scope.active.feedback.list, "current", override)
                .then(function(data) {
                    if(data.status == "OK"){
                        backend.putLogEvent("putFeedback", "OK");
                        $scope.retrainData.message = data.model;
                        $scope.retrainData.status = "OK";

                        $scope.loadEncounter($scope.active.encounterId);
                        $scope.clearFeedback();
                    }
                    else{
                        //TODO: Handle conflicts and warnings
                        backend.putLogEvent("Error", "Invalid response from putfeedback - " + data.status);
                        alert("Sorry, something went wrong. Please report this.");
                    }

                    $scope.retrainData.loading = false;

                }, function() { 
                    backend.putLogEvent("Error", "Unable to send feedback.");
                    alert("Unable to send feedback."); 
                    $scope.retrainData.loading = false;
                    $scope.retrainData.status = "Fail";
                    $scope.retrainData.message ="Unable to send feedback!" 
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
                    

        // /*
        //  * Tabs
        //  */

        // $scope.tabs = {docView: true};
        // $scope.isNavCollapsed = false;

        /*
         * Keypress
         */
         //TODO: This needs to done in a directive
        // $scope.keypressCallback = function($event, reverse) {
        //     if (! $($event.target.nodeName).is("input")){
        //         $event.preventDefault();
                
        //         let hl_elements = $("[scroll-bookmark^='annotation-helper']");

        //         if(hl_elements != -1){
        //             //Remove prior annimations
        //             $('html, body').clearQueue();
        //             $(hl_elements[$scope.active.hl_index]).removeClass('highlight-flash');
        //         }

        //         if(hl_elements.length){
        //             if(reverse){
        //                 if($scope.active.hl_index <= 0)
        //                     $scope.active.hl_index  = hl_elements.length - 1;
        //                 else
        //                     $scope.active.hl_index  = $scope.active.hl_index - 1;
        //             }
        //             else{
        //                 if($scope.active.hl_index >= hl_elements.length - 1)
        //                     $scope.active.hl_index = 0;
        //                 else
        //                     $scope.active.hl_index = $scope.active.hl_index + 1;
        //             }

        //             let found = hl_elements[$scope.active.hl_index];

        //             // $('html, body').animate({scrollTop: $(found).offset().top - 200}, 1000); //ScrollTo doesn't work here :(
        //             found.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
        //             $(found).addClass("highlight-flash");
        //             $timeout(function () { 
        //                 $(found).removeClass('highlight-flash');
        //             }, 2000);
        //         }


        //     }
        // };


        /*
         * Misc.
         */

        function showError (notice){
            $window.alert(notice)
        }

        // $scope.popReport = function(reportid) {
        //     //http://stackoverflow.com/questions/2255291/print-the-contents-of-a-div
        //     var mywindow = $window.open('', reportid, "location=no, toolbar=no, scrollbars=yes, width=800");
        //     mywindow.document.write('<html><head><title>Report #'+ reportid +'</title>');
        //     mywindow.document.write('</head><body><pre>');

        //     //Hide annotator classes
        //     var tree = $("<div" + $("#emr-report-" + reportid + " pre").html() + "</div>");
        //     tree.find(".annotator-hide").remove()
        //     mywindow.document.write(tree.html());

        //     mywindow.document.write('</pre></body></html>');
        // }

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

        /*
         * Sorting
         */

        // function variableCompare(variable) {
        //     return function(a, b) {
        //         var diff = a[variable].confidence - b[variable].confidence;

        //         if(diff === 0)
        //             return parseInt(a.id) - parseInt(b.id);
        //         else
        //             return diff
        //     }
        // }

        // function idCompare() {
        //     return function(a, b) {
        //         return parseInt(a.id) - parseInt(b.id);
        //     }
        // }

        // String.prototype.truncate = function(length, end) {
        //     if (isNaN(length))
        //         length = 10;

        //     if (end === undefined)
        //         end = "...";

        //     if (this.length <= length || this.length - end.length <= length) {
        //         return this;
        //     }
        //     else {
        //         return String(this).substring(0, length-end.length) + end;
        //     }
        // }

        return true;
    }])
