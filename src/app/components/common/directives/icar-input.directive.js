/**
 * Created by smiddela on 10/09/16.
 */

(function () {

    angular
        .module('uiplatform')
        .directive('icarInput', icarInput);

    function icarInput($log) {
        return {
            restrict: 'AE',
            template: '<md-input-container>\
                        <label>Username</label>\
                       <input type="text" ng-model="content.data.model" ng-disabled="!content.data.editable">\
                        </md-input-container>',
            link : function(scope, element, attrs) {
                    // $log.log("inside icarInput Directive");
                    // $log.log(scope.content);
                    // $log.log(attrs);
            }
        }
    }
})();
