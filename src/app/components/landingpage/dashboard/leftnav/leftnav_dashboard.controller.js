/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($scope, $rootScope, $log, intellicarAPI,
                                        leftNavDashboardService, $state) {

        $log.log('LeftNavDashboardController');
        var vm = this;
        vm.state = $state;

        vm.getMyVehicles = function (data) {
            $log.log("getMyVehicles");
            $log.log(data);
            //$scope.tree_data = intellicarAPI.treeDataService.management_tree_data(data, {});
        };

        vm.getMyVehiclesFailure = function (data) {
            $log.log("getMyVehiclesFailure");
            $log.log(data);
            //$scope.tree_data = intellicarAPI.treeDataService.management_tree_data(data, {});
        };

        vm.initialize = function () {
            leftNavDashboardService.getTreeMyVehicles({})
                .then(vm.getMyVehicles, vm.getMyVehiclesFailure);
        }

        vm.initialize2 = function () {
            if (vm.state.current.name == intellicarAPI.stateService.STATE_HOME_DASHBOARD ||
                vm.state.current.name == intellicarAPI.stateService.STATE_HOME) {
                leftNavDashboardService.getMyVehicleTree({});
            }
        }

        vm.getMyVehicleTree = function (data) {
            $log.log(data.data.data);
            $scope.tree_data = intellicarAPI.treeDataService.management_tree_data(data, {});
        }


        $scope.test = function () {
            console.log('clicked');
            //leftNavDashboardService.getVehicleInfo();
        }

        $scope.toggleCheck = function (node) {
            $log.log("checkStatus = " + node.checkStatus);
            if (node.checkStatus === "checked") {
                node.checkStatus = "unchecked";
            } else {
                node.checkStatus = "checked";
            }

            if (node.nodes.length)
                $scope.propagateCheckFromParent(node.nodes, node.checkStatus);

            $scope.verifyAllParentsCheckStatus($scope.tree_data);
        };

        $scope.propagateCheckFromParent = function (nodes, status) {
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                node.checkStatus = status;
                if (node.nodes)
                    $scope.propagateCheckFromParent(node.nodes, status)
            }
        };

        $scope.verifyAllParentsCheckStatus = function (nodes) {
            var retVal = "";
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                $log.log(node);
                if (node.nodes.length) {
                    node.checkStatus = $scope.verifyAllParentsCheckStatus(node.nodes);
                }
                if (retVal === "") {
                    retVal = node.checkStatus;
                    // console.log("set ret");
                }
                if (retVal != node.checkStatus)
                    return "partlyChecked";

            }
            return retVal;
        };

        vm.addAllListeners = function () {
            leftNavDashboardService.addListener('getMyVehicleTree', vm.getMyVehicleTree);
        }

        vm.addAllListeners();
        vm.initialize();
    }
})();