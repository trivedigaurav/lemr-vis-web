// 'use strict';

/* Directives */


angular.module('myApp.directives', [])

.directive('scrollToBookmark', ['$timeout', function($timeout) {
    return {
      lastEl: null,
      lastCount: 0,
      link: function(scope, element, attrs) {
        let value = attrs.scrollToBookmark;
        
        element.bind("click", function(e){
          scope.$apply(function() {
            let selector = "[scroll-bookmark='"+ value +"']";
            let found = $(selector);

            if(found.length){
                //This is a continued search
                if (value == this.lastEl){
                    //Goto next
                    this.lastCount += 1;

                    //Start from begining
                    if (this.lastCount >= found.length)
                        this.lastCount = 0;
                }
                else{
                    //This is a new search
                    this.lastEl = value;
                    this.lastCount = 0;
                }

                $(".highlight-flash").removeClass("highlight-flash");
                // $('#main').animate({scrollTop: $(found).position().top - 100}, 1000); //ScrollTo doesn't work here :(
                found[this.lastCount].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
                $(found[this.lastCount]).addClass("highlight-flash");
                // console.log($(".highlight-flash"));
                $timeout(function () { 
                    $(found).removeClass('highlight-flash');
                }, 2000);

                // $(found[this.lastCount]).removeClass('animated pulse').addClass('animated pulse').one('animationend', function(){
                //     $(this).removeClass('animated pulse');
                // });

            } else {
                $(element).parent("div").removeClass('animated shake').addClass('animated shake').one('animationend', function(){
                    $(this).removeClass('animated shake');
                });
            }
          });
        });
      }
    };
}])

.directive('confirmClick', [function(){
    return {
        link: function (scope, element, attr) {
            var msg = attr.confirmClick || "Are you sure?";
            var callback = attr.onConfirmClick;

            element.bind('click',function (event) {
                if ( window.confirm(msg) ) {
                    scope.$eval(callback);
                    scope.$apply();
                }
            });
        }
    };
}])

// .directive('ngContextMenu', function ($parse) {
//     var renderContextMenu = function (scope, event, options) {
//         // if (!$) { var $ = angular.element; }
//         // $(event.currentTarget).addClass('context');
        
//     };

//     var NOP = function() {};

//     return function (scope, element, attrs) {
//         element.on('contextmenu', function (event) {
//             scope.$apply(function () {
//                 event.preventDefault();
//                 NOP(element);
//                 NOP(attrs);
//                 alert("Right click");
//                 // var options = scope.$eval(attrs.ngContextMenu)();
//                 // if (options instanceof Array) {
//                 //     if(options.length > 0)
//                 //         renderContextMenu(scope, event, options);
//                 // } else {
//                 //     throw '"' + attrs.ngContextMenu + '" not an array';                    
//                 // }
//             });
//         });
//     };
// })

// .directive('sglclick', ['$parse', function($parse) {
//     return {
//         restrict: 'A',
//         link: function(scope, element, attr) {
//           var fn = $parse(attr['sglclick']);
//           var delay = 300, clicks = 0, timer = null;
//           element.on('click', function (event) {
//             clicks++;  //count clicks
//             if(clicks === 1) {
//               timer = setTimeout(function() {
//                 scope.$apply(function () {
//                     fn(scope, { $event: event });
//                 }); 
//                 clicks = 0;             //after action performed, reset counter
//               }, delay);
//               } else {
//                 clearTimeout(timer);    //prevent single-click action
//                 clicks = 0;             //after action performed, reset counter
//               }
//           });
//         }
//     };
// }]);
