'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('appCtrl', ['$scope', '$window', '$document', '$rootScope', 'backend', 'truncateFilter',
    function($scope, $window, $document, $rootScope, backend, truncateFilter) {
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
        }

        checkLogin();

        function checkLogin(manual) {
            backend.checkLogin()
                .then(function () {
                    $scope.active.username = backend.getUserName();
                    startSession();
                }, function() {
                    if(manual) {
                        $("#login-box").addClass('has-error animated shake');
                    }
                    $scope.active.username = null;
                });
        }

        $scope.doLogin = function() {
            $("#login-box").removeClass('has-error animated shake');
            backend.login($("#input-username").val(), $("#input-password").val());
            checkLogin(true);
        }

        $scope.doLogout = function() {
            var confirm = true;

            if($scope.feedbackList.length > 0){
                confirm = $window.confirm("You have made unsaved changes. Would you still like to leave this page?");
            }

            if(confirm) {
                backend.putLogEvent("trackVisited", JSON.stringify($scope.trackVisited));
                backend.putLogEvent("trackFeedback", JSON.stringify($scope.trackFeedback));
                backend.putLogEvent("gridData", JSON.stringify($scope.gridData));

                $scope.clearFeedback();
                backend.logout();
                $scope.active.username = null;
            }
        }

        function startSession(){
            backend.putLogEvent("startSession", "OK");
        }

        /*
         * Load reports
         */

        $scope.records = {
            "report": {
                exists: true,
                text: null,
                id: null
            },
            "pathology": {
                exists: false,
                text: null
            }
        }

        $scope.records.report.id = "302";

        backend.getReport($scope.records.report.id).then(function(data) {
            $scope.records.report.text = data.reportText;
            $scope.records.report.exists = true;
        }, function() {
            $scope.records.report.text = "Unable to fetch report";
            stopLoading();
        });

        /*
         * Tabs
         */

        $scope.tabs = {docView: true};


        /*
         * Feedback Context Menu
         */

        // $scope.setFeedbackText = function(){
        //     var selection = rangy.getSelection();

        //     if(!selection.isCollapsed) {
        //             selection.expand("word");

        //             var text = selection.toString().trim();

        //             if (text) {
        //                 $scope.feedbackText = text;
        //                 return;
        //             }
        //     }
        //     else{
        //         $scope.feedbackText = null;
        //     }
        // };

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
         * Misc.
         */

        function showInfo (notice){
            $scope.appInfo = notice;

            setTimeout(function() {
              $scope.appInfo = false;
              $scope.$digest();
            }, 1500);
        }

        // Loading
        $scope.loaderCount = 0;
        $scope.appDisabled = false;

        function startLoading() {
            $scope.loaderCount += 1;
        }

        function stopLoading() {
            if ($scope.loaderCount > 1)
                $scope.loaderCount -= 1;
            else
                $scope.loaderCount = 0;
        }

        $scope.keypressCallback = function($event, reverse) {
            if (! $($event.explicitOriginalTarget).is("input")){
                $scope.gotoNextDoc(reverse);
                $event.preventDefault();
            }
        };


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
