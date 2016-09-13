/**
 * Created by harshas on 13/9/16.
 */


(function () {

    angular
        .module('uiplatform')
        .directive('icarReadonlyList', icarReadonlyList);

    function icarReadonlyList($log) {
        return {
            restrict: 'AE',
            template: '<md-content>\
                        <label>Username</label>\
                            <div ng-repeat="d in data">{{d}}</div>\
                        </md-content>',
            link : function(scope, element, attrs) {
                // $log.log("inside icarInput Directive");
                // $log.log(scope.content);
                // $log.log(attrs);
                scope.data = scope.content.data.default;

            }
        }
    }
})();
