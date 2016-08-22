/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('LeftNavManagementController', LeftNavManagementController);

    function LeftNavManagementController($scope, $rootScope, $log, intellicarAPI,
                                         leftNavManagementService, $state) {

        $log.log('LeftNavManagementController');
        var vm = this;
        vm.state = $state;

        // vm.toggleLeftnav = function(event, data) {
        //     vm.left_nav_toggle = data.left_nav_toggle;
        // }
        //
        // $scope.$on('toggleLeftnav', vm.toggleLeftnav);

        // vm.getMyVehicleTree = function(data) {
        //     $log.log(data.data.data);
        //     $scope.tree_data = intellicarAPI.treeDataService.management_tree_data(data, {});
        // }

        vm.getMyVehiclesManage = function(data) {
            $log.log("getMyVehiclesManage");
            $log.log(data);
            //$scope.tree_data = intellicarAPI.treeDataService.management_tree_data(data, {});
        }

        vm.getMyVehiclesManageFailure = function(data) {
            $log.log("getMyVehiclesManageFailure");
            $log.log(data);
            //$scope.tree_data = intellicarAPI.treeDataService.management_tree_data(data, {});
        }

        vm.addAllListeners = function() {
            //leftNavManagementService.addListener('getMyVehicleTree', vm.getMyVehicleTree);
            //leftNavManagementService.addListener('getMyVehiclesManage', vm.getMyVehiclesManage);
        }

        vm.initialize = function() {
            console.log(vm.state);
            if(vm.state.current.name == intellicarAPI.stateService.STATE_HOME_MANAGEMENT) {
                //leftNavManagementService.getMyVehicleTree({});
                leftNavManagementService.getMyVehiclesManage({})
                    .then(vm.getMyVehiclesManage, vm.getMyVehiclesManageFailure);

            }
        }

        vm.addAllListeners();
        vm.initialize();

    }
})();
