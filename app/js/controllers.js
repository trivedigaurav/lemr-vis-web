'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('appCtrl', ['$scope', '$window', '$document', 
    '$rootScope', 'backend', 'truncateFilter', '$filter',
    function($scope, $window, $document,
        $rootScope, backend, truncateFilter, $filter) {
        /*
         * Debug
         */

        $window.appCtrl = $scope;
        $scope.cacheBust = Date.now('U');

        /*
         * App config
         */

        $rootScope.config = Object();
        
        $rootScope.config.classificationName = {
            "positive": "True",
            "negative": "False",
            "unclassified": "?"
        };

        $scope.active = {
            encounterId: null,
            encounterData: null, 
            username: null,
            hl_index: -1
        };

        var initMap = '<canvas id="map"></canvas>';

        $scope.doLogout = function() {
            var confirm = true;

            // if($scope.feedbackList.length > 0){
            //     confirm = $window.confirm("You have made unsaved changes. Would you still like to leave this page?");
            // }

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

        $scope.loadEncounter = function(){
            startLoading();

            $("#map").off();
            $('#map').remove();

            $scope.active.encounterData = null;

            backend.putLogEvent("loadEncounter", $scope.active.encounterId);

            backend.getEncounter($scope.active.encounterId).then(function(data) {
                $scope.active.encounterData = data;
                $scope.active.hl_index = -1;
                stopLoading();

                $('body').append(initMap);
                pagemap(document.querySelector("#map"), {
                        // viewport: document.querySelector("#viewport"),
                        //HACK: We don't know when the annotations finish loading
                        interval: 50,
                        styles: {
                            '.info': 'rgba(0,0,0,0.08)',
                            'highlighted-report': '#ffffff',
                            '.annotator-hl-yellow': '#fffc00',
                            '.annotation-helper': 'rgb(255, 139, 139)',
                            '.highlight-flash': '#000000'
                        },
                    });
                
                
            }, function() {
                backend.putLogEvent("loadEncounterFailed", "$scope.active.encounterId");
                showInfo("Unable to load reports");
                stopLoading();
            });
        }


        /*
         * Helper Terms
         */
        $scope.search_list = ["tumor", "mass", "incidental", 
                        "nodule", "note", "adenoma",
                        "cyst", "lesion", "aneurysm"];

        $scope.addTag = function(input){
           if(input !== ''){
                //check if not already there
                if($scope.search_list.indexOf(input) === -1){
                    $scope.search_list.push(input);
                    $scope.insertTag = '';
                }
            }
        }
        
        $scope.closeTag = function(text){
            $scope.search_list = $filter('filter')($scope.search_list, function(value){
            return value != text;
            });
        }
                    

        /*
         * Tabs
         */

        $scope.tabs = {docView: true};
        $scope.isNavCollapsed = false;


        /*
         * Feedback Context Menu
         */

        $scope.expandSelectionText = function(){
            var selection = rangy.getSelection();

            if(!selection.isCollapsed) {
                    selection.expand("word");
                    // var text = selection.toString().trim();

                    // if (text) {
                    //     $scope.feedbackText = text;
                    //     return;
                    // }
            }
            // else{
            //     $scope.feedbackText = null;
            // }
        };

        // $scope.documentContextMenu = function() {
        //     var options = []

        //     if($scope.feedbackText){
        //         options = [
        //             ["Important", function () {
        //                 feedbackFunction('positive');
        //             }],
        //             null,
        //             ["Not important", function () {
        //                 feedbackFunction('negative');
        //             }]
        //         ];
        //     }

        //     return options;
        // };


        /*
         * Keypress
         */
        $scope.keypressCallback = function($event, reverse) {
            if (! $($event.explicitOriginalTarget).is("input")){
                $event.preventDefault();
                
                var hl_elements = $("[scroll-bookmark^='annotation-helper']");

                if(hl_elements.length){
                    if(reverse){
                        if($scope.active.hl_index <= 0)
                            $scope.active.hl_index  = hl_elements.length - 1;
                        else
                            $scope.active.hl_index  = $scope.active.hl_index - 1;
                    }
                    else{
                        if($scope.active.hl_index >= hl_elements.length - 1)
                            $scope.active.hl_index = 0;
                        else
                            $scope.active.hl_index = $scope.active.hl_index + 1;
                    }

                    var found = hl_elements[$scope.active.hl_index ];
                    $('html, body').animate({scrollTop: $(found).offset().top - 200}, 1000); //ScrollTo doesn't work here :(
                    $(found).addClass("highlight-flash");
                    setTimeout(function () { 
                        $(found).removeClass('highlight-flash');
                    }, 2000);
                }


            }
        };


        /*
         * Misc.
         */

        function showInfo (notice){
            $scope.appInfo = notice;

            setTimeout(function() {
              $scope.appInfo = false;
              $scope.$digest();
            }, 1500);
        }

        $scope.popReport = function(reportid) {
            //http://stackoverflow.com/questions/2255291/print-the-contents-of-a-div
            var mywindow = $window.open('', reportid, "location=no, toolbar=no, scrollbars=yes, width=800");
            mywindow.document.write('<html><head><title>Report #'+ reportid +'</title>');
            mywindow.document.write('</head><body><pre>');

            //Hide annotator classes
            var tree = $("<div" + $("#emr-report-" + reportid + " pre").html() + "</div>");
            tree.find(".annotator-hide").remove()
            mywindow.document.write(tree.html());

            mywindow.document.write('</pre></body></html>');
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

        /*
         * Sorting
         */

        function variableCompare(variable) {
            return function(a, b) {
                var diff = a[variable].confidence - b[variable].confidence;

                if(diff === 0)
                    return parseInt(a.id) - parseInt(b.id);
                else
                    return diff
            }
        }

        function idCompare() {
            return function(a, b) {
                return parseInt(a.id) - parseInt(b.id);
            }
        }

        String.prototype.truncate = function(length, end) {
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (this.length <= length || this.length - end.length <= length) {
                return this;
            }
            else {
                return String(this).substring(0, length-end.length) + end;
            }
        }

        return true;
    }])
