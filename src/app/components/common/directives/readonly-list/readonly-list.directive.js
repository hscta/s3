/**
 * Created by smiddela on 09/09/16.
 */


/**
 * Created by smiddela on 06/09/16.
 */


(function () {

    angular
        .module('uiplatform')
        .directive('readOnlyList', readOnlyList);

    function readOnlyList($log, $mdDialog, $stateParams) {
        return {
            restrict: 'AE',
            templateUrl: 'app/components/common/directives/readonly-list/readonly-list.html',
            scope: {
                listData: '=',
            },

            link: function (scope) {

            }
        }
    }
})();

