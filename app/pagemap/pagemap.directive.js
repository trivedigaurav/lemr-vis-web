angular.module('pagemap.directive', [])
.directive('pagemap', [function() {
    return {
        restrict: 'E',
        scope: {
            visible: '<',
        },
        link: function (scope, element, attrs) {
                scope.redrawMap = function() {

                    $("#map").off();
                    $('#map').remove();

                    $('body').append('<canvas id="map"></canvas>');
                    pagemap(document.querySelector("#map"), {
                        // viewport: document.querySelector("#viewport"),
                        //HACK: We don't know when the annotations finish loading
                        interval: 500,
                        viewport: document.querySelector("#main"),
                        styles: {
                            '.info': 'rgba(0,0,0,0.08)',
                            '.report pre': '#ffffff',
                            '.report-incidental': '#fffee5',
                            '.section-incidental': '#fffdb2',
                            '.sentence': 'rgba(0,0,0,0.04)',
                            '.sentence-incidental': '#E5E100',
                            '.annotator-hl-yellow': '#E5E100',
                            '.annotation-helper': 'rgb(255, 139, 139)',
                            '.highlight-flash': '#000000',
                        },
                    });
                };

                scope.redrawMap();
        
                scope.$watch('visible', function(){
                    
                    $("#map").off();
                    $('#map').remove();

                    if(scope.visible)
                        scope.redrawMap();
                    
                });
        }
    };
}])