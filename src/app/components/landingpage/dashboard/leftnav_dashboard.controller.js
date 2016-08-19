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
        vm.assetList =  null;

        // vm.toggleLeftnav = function(event, data) {
        //    // $log.log('dashboard navvvvvvvv ')
        //     vm.left_nav_toggle = data.left_nav_toggle;
        // }

        vm.displayTree = function(data) {
            //$log.log(data.data.data);
            vm.assetList = data.data.data;
            $scope.tree_data = treeDataService.management_tree_data(data);

            children = {};
            for(idx in vm.assetList) {
                first = vm.assetList[idx];
                $log.log(first);
                for(item in vm.assetList) {
                    second = vm.assetList[item];
                    if(first.groupid == second.groupid)
                        continue;
                    if(!(first.groupid in children))
                        children[first.groupid] = [];
                    if(first.groupid == second.pgroupid) {
                        children[first.groupid].push(second);
                    }
                }
            }
            //$log.log(children);
            for(idx in children) {}
        }

        vm.initialize = function() {
           // console.log(vm.state);
            if(vm.state.current.name == constantsDashboard.STATE_HOME_DASHBOARD ||
                vm.state.current.name == constantsDashboard.STATE_HOME) {
                //leftNavDashboardService.getTree();
                leftNavDashboardService.getGroups();
            }
        }

        leftNavDashboardService.addTreeCallback(vm.displayTree);
        vm.initialize();
       // $scope.$on('toggleLeftnav', vm.toggleLeftnav);
    }
})();
