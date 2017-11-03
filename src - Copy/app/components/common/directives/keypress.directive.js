/**
 * Created by harshas on 29/9/16.
 */

(function () {

    angular
        .module('uiplatform')
        .directive('icarKeypress', icarKeypress)

    function icarKeypress() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.icarKeypress);
                    });

                    event.preventDefault();
                }
            });
        };
    }
})();
