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
                            <div class="error" ng-show="showErrorMsg">Maximum Selection is \
                            {{maxSelection}}\
                            </div>\
                            <div layout="row" layout-wrap flex="100" flex-gm-sm="20">\
                                <md-checkbox aria-label="Select All"\
                                    ng-checked="isChecked()"\
                                    md-indeterminate="isIndeterminate()"\
                                    ng-click="toggleAll()"  ng-show="showSelectAll">\
                                    <span ng-if="isChecked()">Un-</span>Select All\
                                </md-checkbox flex>\
                            </div>\
                            <div class="" ng-repeat="item in items" layout-padding>\
                            <md-checkbox ng-checked="exists(item, selected)" \
                                ng-click="toggle(item, selected)" ng-disabled="scope.content.data.editable">\
                                {{ item }}\
                            </md-checkbox>\
                           </div>\
                        </md-content>',

            link : function(scope, element, attrs) {
                scope.selectedCount = scope.content.data.default.length;
                scope.minSelection = scope.content.data.select[0];
                scope.maxSelection = scope.content.data.select[1];


                //$log.log(scope.maxSelection, scope.content.data.select[2].length);
                if ( scope.maxSelection >= scope.content.data.select[2].length )
                    scope.showSelectAll = true;
                else
                    scope.showSelectAll = false;

                scope.items = scope.content.data.select[2];
                scope.selected = scope.content.data.default;


                scope.toggle = function (item, list) {
                    $log.log(scope.selectedCount);

                    // return;
                    var idx = list.indexOf(item);
                    $log.log(scope.selectedCount , scope.maxSelection);
                    if (idx > -1) {
                        $log.log('selected');
                        list.splice(idx, 1);
                        $log.log(list);
                        scope.selectedCount < 0 ? 0 : --scope.selectedCount;
                        scope.showErrorMsg = false;
                    }
                    else {
                        if (parseInt(scope.selectedCount) < parseInt(scope.maxSelection)) {
                            $log.log('Unselected');
                            list.push(item);
                            scope.selectedCount += 1;
                            scope.showErrorMsg = false;
                        }else{
                            scope.showErrorMsg = true;
                        }
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
