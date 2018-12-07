angular.module('pagemap.directive', [])
.directive('pagemap', [function() {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
                scope.redrawMap = function() {

                    $("#map").off();
                    $('#map').remove();

                    $('body').append('<canvas id="map"></canvas>');
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
                };

                scope.redrawMap();
        
                // scope.$watchGroup(['dirty'], function(){
                //     scope.redrawMap();
                //     scope.dirty = false;
                //     // console.log("Directive redrawn!");
                // }, true);
        }
    };
}])