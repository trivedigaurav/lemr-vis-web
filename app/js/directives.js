// 'use strict';

/* Directives */


angular.module('myApp.directives', [])
.directive('horizontalSplitter', ['$document', function($document) {
    return function(scope, element, attr) {
        var start = 0, cursor_offset = 0

        if(!angular.isFunction($(element).offset)) {
            throw new Error('Need jquery!');
        }

        var topHeight = 0, bottomHeight = 0, y = 0;

        var minTop = 0.1*$(element).prev().height();
        var minBottom = 0.1*$(element).next().height();

        element.on('mousedown', function(event) {
            // Prevent default dragging of selected content
            event.preventDefault();
            
            cursor_offset = event.pageY - $(element).position().top;
            start = event.pageY;

            topHeight = $(element).prev().height();
            bottomHeight = $(element).next().height();

            $document.on('mouseup', mouseup);
            $document.on('mousemove', mousemove);
            $('body').addClass('resizable');

            scope.$apply(function(){
                scope.appDisabled = true;    
            });

        });

        function mousemove(event) {
            var delta = event.pageY - start;

            if( (topHeight + delta) > minTop && 
                    (bottomHeight - delta) > minBottom)
            {
                $("#sidebar-resize-indicator").css({ top: event.pageY - cursor_offset });
                y = delta
            }
        }

        function mouseup() {
            $(element).prev().height(topHeight + y); 
            $(element).next().height(bottomHeight - y);
            y = 0;

            $("#sidebar-top").trigger('heightChange'); 
            
            $("#sidebar-resize-indicator").css({ top: "-9999px" });

            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
            $('body').removeClass('resizable');

            scope.$apply(function(){
                scope.appDisabled = false;
            });
        }
    };
}])


//From http://nadeemkhedr.wordpress.com/2014/01/03/angularjs-scroll-to-element-using-directives/
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

//http://templarian.com/2014/03/29/angularjs_context_menu
.directive('ngContextMenu', function ($parse) {
    var renderContextMenu = function (scope, event, options) {
        // if (!$) { var $ = angular.element; }
        // $(event.currentTarget).addClass('context');

        $('.context-menu').remove();

        var $contextMenu = $('<div>');
        $contextMenu.addClass('dropdown clearfix context-menu');
        var $ul = $('<ul>');
        $ul.addClass('dropdown-menu');
        $ul.attr({ 'role': 'menu' });
        $ul.css({
            left: event.pageX + 'px',
            top: event.pageY + 'px',
        });

        angular.forEach(options, function (item, i) {
            var $li = $('<li>');
            if (item === null) {
                $li.addClass('divider');
            } else {

                if(item[1]){
                    $a = $('<a>');
                    $a.attr({ tabindex: '-1', href: '#' });
                    $a.text(item[0]);
                    $li.append($a);
                    $li.on('click', function () {
                        scope.$apply(function() {
                            item[1].call(scope, scope);
                        });
                    });
                }
                else{
                    $li.addClass('dropdown-header');
                    $li.text(item[0]);
                }
            }
            $ul.append($li);
        });
        $contextMenu.append($ul);
        $(document).find('body').append($contextMenu);
        $($contextMenu).on("click", function (event) {
            // $(event.currentTarget).removeClass('context');
            scope.$apply(function() {
                scope.setFeedbackText();
            });
            $contextMenu.remove();
        }).on('contextmenu', function (event) {
            // $(event.currentTarget).removeClass('context');
            event.preventDefault();
            $contextMenu.remove();
        });
    };
    return function (scope, element, attrs) {
        element.on('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                var options = scope.$eval(attrs.ngContextMenu)();
                if (options instanceof Array) {
                    if(options.length > 0)
                        renderContextMenu(scope, event, options);
                } else {
                    throw '"' + attrs.ngContextMenu + '" not an array';                    
                }
            });
        });
    };
})

.directive('sglclick', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
          var fn = $parse(attr['sglclick']);
          var delay = 300, clicks = 0, timer = null;
          element.on('click', function (event) {
            clicks++;  //count clicks
            if(clicks === 1) {
              timer = setTimeout(function() {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                }); 
                clicks = 0;             //after action performed, reset counter
              }, delay);
              } else {
                clearTimeout(timer);    //prevent single-click action
                clicks = 0;             //after action performed, reset counter
              }
          });
        }
    };
}]);
