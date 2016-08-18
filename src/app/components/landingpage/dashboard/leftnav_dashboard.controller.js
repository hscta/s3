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

            //$log.log('dashboard navvvvvvvv ')
            vm.dummy = data.dummy;
        }

        vm.displayTree = function(data) {
            //$log.log("displayTree");
           // $log.log(data);
            $scope.tree_data = treeDataService.arrange_data(data);
        }


        vm.initialize = function() {
            console.log(vm.state);
            if(vm.state.current.name == constantsDashboard.STATE_HOME_DASHBOARD ||
                vm.state.current.name == constantsDashboard.STATE_HOME) {
                leftNavDashboardService.getTree();
            }
        }

        leftNavDashboardService.addTreeCallback(vm.displayTree);
        vm.initialize();
        $scope.$on('toggleLeftnav', vm.toggleLeftnav);

/*
        $scope.tree_data = [
            {
                "id": 1,
                "title": "node1",
                "nodes": [
                    {
                        "id": 22,
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
                "id": 7,
                "title": "node2",
                "nodrop": true,
                "nodes": [
                    {
                        "id": 71,
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
        */
    }
})();
