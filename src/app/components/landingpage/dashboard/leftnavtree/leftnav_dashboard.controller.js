/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

        // .filter('trust', function ($sce) {
        //     return function (val) {
        //         return $sce.trustAsHtml(val);
        //     };
        // });

    function LeftNavDashboardController($scope, $rootScope, $log, intellicarAPI,
                                        leftNavDashboardService, $state, $filter) {

        $scope.treeFilter = $filter('uiTreeFilter');

        $log.log('LeftNavDashboardController');
        var vm = this;
        vm.state = $state;
        vm.tree_search_pattern = '';
        vm.search_results;

        vm.getDashboardTree = function (data) {
            //$log.log("getDashboardTree");
            //$log.log(data);
            vm.tree_data = data;
            //$log.log(vm.tree_data);
        };

        vm.getDashboardTreeFailure = function (data) {
            $log.log("getDashboardTreeFailure");
            $log.log(data);
        };


        vm.initialize = function () {
            leftNavDashboardService.getDashboardTree({})
                .then(vm.getDashboardTree, vm.getDashboardTreeFailure);
        };


        vm.test = function () {
            console.log('clicked');
            //leftNavDashboardService.getVehicleInfo();
        };

        vm.toggleCheck = function (item) {
            //$log.log("checkStatus = " + item.checkStatus);
            if (item.checkStatus === "checked") {
                item.checkStatus = "unchecked";
            } else {
                item.checkStatus = "checked";
            }

            if (item.items.length) {
                vm.propagateCheckFromParent(item.items, item.checkStatus);
            } else {
                //mqtt subscription for realtime data
                vm.subscribe(item);
            }

            vm.verifyAllParentsCheckStatus(vm.tree_data);
        };


        vm.propagateCheckFromParent = function (items, status) {
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                item.checkStatus = status;


                //vm.subscribe(item);
                //$log.log("my item");
                //$log.log(item);

                if (item.items.length) {
                    vm.propagateCheckFromParent(item.items, status);
                } else {
                    //mqtt subscription for realtime data
                    vm.subscribe(item);
                }
            }
        };


        vm.subscribe = function(item) {
            if (item.checkStatus === "checked") {
                intellicarAPI.mqttService.subscribeAsset(item);
            } else {
                intellicarAPI.mqttService.unsubscribeAsset(item);
            }
        };


        vm.verifyAllParentsCheckStatus = function (items) {
            var retVal = "";
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                //$log.log(item);
                if (item.items.length) {
                    item.checkStatus = vm.verifyAllParentsCheckStatus(item.items);
                }
                if (retVal === "") {
                    retVal = item.checkStatus;
                    // console.log("set ret");
                }
                if (retVal != item.checkStatus)
                    return "partlyChecked";

            }
            return retVal;
        };

        vm.expandAll = function () {
            if ( vm.tree_search_pattern.length <= 0 ){
                $scope.$broadcast('angular-ui-tree:expand-all');
            } else {
                $scope.$broadcast('angular-ui-tree:collapse-all');
            }
        };

        vm.expand_tree = function () {
            $log.log('expand');
            $scope.$broadcast('angular-ui-tree:collapse-all');

        }

        vm.addAllListeners = function () {

        };

        vm.addAllListeners();
        vm.initialize();
    }
})();