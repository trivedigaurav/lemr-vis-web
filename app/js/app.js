'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
  'myApp.directives',
  'myApp.services',
  'myApp.controllers',
  'myApp.filters',
  'ui.bootstrap',
  'ngCookies',
  'ui.keypress',
  'search.tags',
  'encounter.select',
  'login',
  'highlightedReport.directive',
  'pagemap.directive'
]);