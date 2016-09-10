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
            template: '<md-input-container>\
                        <label>Username</label>\
                       <input type="text" ng-model="content.data.default" ng-disabled="!content.data.editable">\
                        </md-input-container>\
                        </md-input-container>',
            link : function(scope, element, attrs) {
                    $log.log("inside icarInput Directive");
                    $log.log(scope.content);
                    $log.log(attrs);
            }
        }
    }
})();
