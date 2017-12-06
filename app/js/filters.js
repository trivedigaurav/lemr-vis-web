'use strict';

/* Filters */

angular.module('myApp.filters', [])
  .filter('truncate', function () {
        // jsfiddle.net/tUyyx/
        return function (string, length, end) {

            if(!string)
                return;

            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (string.length <= length || string.length - end.length <= length) {
                return string;
            }
            else {
                return String(string).substring(0, length-end.length) + end;
            }

        };
    })
   .filter('myDate', function () {
        // jsfiddle.net/tUyyx/
        return function (string) {

            if(!string)
                return;

            string=String(string);

            if (string.length != 8) {
                return string;
            }
            else {
                return string.substring(4, 6) + "/" + string.substring(6,8);
            }

        };
    })
