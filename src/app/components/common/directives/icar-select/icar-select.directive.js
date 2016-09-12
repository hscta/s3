/**
 * Created by harshas on 12/9/16.
 */


(function () {

    angular
        .module('uiplatform')
        .directive('icarSelectList', icarSelectList);

    function icarSelectList($log) {
        return {
            restrict: 'AE',
            template: ' <md-content layout="row" layout-wrap>\
                        <div layout="row" layout-wrap flex="100" flex-gm-sm="20">\
                            <md-checkbox aria-label="Select All"\
                                ng-checked="isChecked()"\
                                md-indeterminate="isIndeterminate()"\
                                ng-click="toggleAll()">\
                                <span ng-if="isChecked()">Un-</span>Select All\
                            </md-checkbox flex>\
                        </div>\
                        <div class="" ng-repeat="item in items" layout-padding>\
                        <md-checkbox ng-checked="exists(item, selected)" ng-click="toggle(item, selected)">\
                            {{ item }}\
                        </md-checkbox>\
                       </div>\
                        </md-content>',

            link : function(scope, element, attrs) {
                $log.log(scope.content.data.select[1]);
                $log.log('ssssssssssssssssssssssssssssssssssssssssssssss');

                scope.items = scope.content.data.select[2];
                scope.selected = [];
                scope.toggle = function (item, list) {
                    var idx = list.indexOf(item);
                    if (idx > -1) {
                        list.splice(idx, 1);
                    }
                    else {
                        list.push(item);
                    }
                };

                scope.exists = function (item, list) {
                    return list.indexOf(item) > -1;
                };

                scope.isIndeterminate = function() {
                    return (scope.selected.length !== 0 &&
                    scope.selected.length !== scope.items.length);
                };

                scope.isChecked = function() {
                    return scope.selected.length === scope.items.length;
                };

                scope.toggleAll = function() {
                    if (scope.selected.length === scope.items.length) {
                        scope.selected = [];
                    } else if (scope.selected.length === 0 || scope.selected.length > 0) {
                        scope.selected = scope.items.slice(0);
                    }
                };
            }
        }
    }
})();
