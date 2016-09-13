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
            template: '<md-content layout="row" layout-wrap>\
                        <label flex="100">Username</label><br/>\
                            <div ng-repeat="d in data" layout-padding>{{d}}</div>\
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
