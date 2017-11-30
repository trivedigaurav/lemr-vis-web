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


.directive('highlightedReport', ['backend', function(backend) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            recordId: '='
        },
        link: function (scope, element, attrs) {

                scope.highlightTerms = function() {

                    if(!scope.data)
                        return
                
                    element.text(scope.data.replace(/</g,' &lt; ')
                                    .replace(/>/g,' &gt; '));

                    $(element).highlight(/S_O_H[\s\S]*E_O_H/, "dim") // header
                        .highlight(/De-ID.*reserved./i, "dim") //copright
                        .highlight(/\[Report de-identified.*/i, "dim") //De-ID
                        .highlight(/\*\* Report Electronically Signed Out \*\*/, "dim") //Pathology template
                        .highlight(/My signature is attestation[\s\S]*reflects that evaluation./, "dim") //Pathology template
                        .highlight(/E_O_R/, "dim") //End of report


                    $(element).highlight(/[a-zA-Z\-\ #]*\:/g, "bold") //Colon fields
                            .highlight(/\*\*[a-zA-Z\ ,-\[\]\.]*/g, "dim"); //DE-IDed Names


                    //For line numbers
                    element.html('<code>' + element.html()
                                    .split('\n')
                                    .join(' </code>\n<code>') + '</code>');

                    //Initialize annotator
                    var options = {};
                    
                    var annotator = angular.element(element).annotator(options).data('annotator');

                    annotator.addPlugin('Categories', {
                        mechanism: 'annotator-hl-green',
                        toDo: 'annotator-hl-red',
                        problem: 'annotator-hl-yellow',
                        intervention: 'annotator-hl-blue' 
                    });

                    // console.log(backend.getAnnotationBackend());

                    annotator.addPlugin('Store', {
                        // The endpoint of the store on your server.
                        prefix: "",
                        urls: backend.getAnnotationUrls(scope.recordId)
                    });

                };
        
                scope.$watch('data', function(){
                    scope.highlightTerms();
                }, true);
        }
    };
}])

//From http://nadeemkhedr.wordpress.com/2014/01/03/angularjs-scroll-to-element-using-directives/
.directive('scrollToBookmark', ['$timeout', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        var value = attrs.scrollToBookmark;
        element.bind("click", function(e){
          scope.$apply(function() {
            var selector = "[scroll-bookmark='"+ value +"']";
            var found = $(selector);

            if(found.length){
                $('html, body').animate({scrollTop: $(found).offset().top - 100}, 1000); //ScrollTo doesn't work here :(
                $(found).addClass("highlight-flash");
                $timeout(function () { 
                    $(found).removeClass('highlight-flash');
                }, 2000);
            } else {
                $(element).removeClass('animated shake').addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
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
