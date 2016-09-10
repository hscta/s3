/**
 * Created by smiddela on 10/09/16.
 */

(function () {

    angular
        .module('uiplatform')
        .directive('icarInput', icarInput);

    function icarInput($log, $mdDialog, $stateParams) {
        return {
            restrict: 'AE',
            template: '<div></div>',

            link : function(scope, element, attrs) {
                $log.log("inside icarInput Directive");
                $log.log(scope.content);
                $log.log(attrs);
            }
        }
    }
})();
