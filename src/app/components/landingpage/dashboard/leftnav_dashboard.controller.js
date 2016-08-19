/**
 * Created by smiddela on 15/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($scope, $rootScope, $state, constantsDashboard, navService,
                                        $mdSidenav, $log, $document,
                                        leftNavDashboardService, requestService) {

        $log.log('LeftNavDashboardController');
        var vm = this;
        vm.state = $state;
        vm.assetList =  null;

        vm.toggleLeftnav = function(event, data) {

            //$log.log('dashboard navvvvvvvv ')
            vm.dummy = data.dummy;
        }

        vm.displayTree = function(data) {
            //$log.log(data.data.data);
            vm.assetList = data.data.data;
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
            console.log(vm.state);
            if(vm.state.current.name == constantsDashboard.STATE_HOME_DASHBOARD ||
                vm.state.current.name == constantsDashboard.STATE_HOME) {
                //leftNavDashboardService.getTree();
                leftNavDashboardService.getGroups();
            }
        }

        leftNavDashboardService.addTreeCallback(vm.displayTree);
        vm.initialize();
        $scope.$on('toggleLeftnav', vm.toggleLeftnav);


        $scope.tree_data = [
            {
                "id": 1,
                "title": "node1",
                "nodes": [
                    {
                        "id": 11,
                        "title": "node1.1",
                        "nodes": [
                            {
                                "id": 111,
                                "title": "node1.1.1",
                                "nodes": []
                            }
                        ]
                    },
                    {
                        "id": 12,
                        "title": "node1.2",
                        "nodes": []
                    }
                ]
            },
            {
                "id": 2,
                "title": "node2",
                "nodrop": true,
                "nodes": [
                    {
                        "id": 21,
                        "title": "node2.1",
                        "nodes": []
                    },
                    {
                        "id": 22,
                        "title": "node2.2",
                        "nodes": []
                    }
                ]
            },
            {
                "id": 3,
                "title": "node3",
                "nodes": [
                    {
                        "id": 31,
                        "title": "node3.1",
                        "nodes": []
                    }
                ]
            }
        ];
    }
})();
