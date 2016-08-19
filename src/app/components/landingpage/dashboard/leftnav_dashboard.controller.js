/**
 * Created by smiddela on 15/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($scope, $rootScope, $state, constantsDashboard, navService,
                                        $mdSidenav, $log, $document,
                                        leftNavDashboardService, requestService, treeDataService) {

        $log.log('LeftNavDashboardController');
        var vm = this;
        vm.state = $state;

        vm.toggleLeftnav = function(event, data) {
           // $log.log('dashboard navvvvvvvv ')
            vm.left_nav_toggle = data.left_nav_toggle;
        }

        vm.displayTree = function(data) {
            //$log.log("displayTree");
           // $log.log(data);
           // $scope.tree_data = treeDataService.dashboard_tree_data(data);
        }

        vm.initialize = function() {
           // console.log(vm.state);
            if(vm.state.current.name == constantsDashboard.STATE_HOME_DASHBOARD ||
                vm.state.current.name == constantsDashboard.STATE_HOME) {
                leftNavDashboardService.getTree();
            }
        }

        leftNavDashboardService.addTreeCallback(vm.displayTree);
        vm.initialize();
        $scope.$on('toggleLeftnav', vm.toggleLeftnav);
    }
})();
