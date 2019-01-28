'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
  'myApp.directives',
  'myApp.services',
  'myApp.mainController',
  'myApp.filters',
  'ui.bootstrap',
  'ngCookies',
  'ui.keypress',
  'search.tags',
  'encounter.select',
  'login',
  'highlightedReport.directive',
  'pagemap.directive',
  'feedbackmenu'
]);


app.run(['$cookieStore', '$http',
    function ($cookieStore, $http) {
        // keep user logged in after page refresh
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
    }]);