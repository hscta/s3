/**
 * Created by smiddela on 15/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .config(function(treeConfig){
            treeConfig.defaultCollapsed = true; // collapse nodes by default
        })
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($scope, $rootScope, $state, dashboardConstants, navService,
                                        $mdSidenav, $log, $document,
                                        leftNavDashboardService, requestService) {

        $log.log('LeftNavDashboardController');
        var vm = this;
        vm.state = $state;

        vm.toggleLeftnav = function(event, data) {

            //$log.log('dashboard navvvvvvvv ')
            vm.dummy = data.dummy;
        }

        vm.initialize = function() {
            console.log(vm.state);
            if(vm.state.current.name == dashboardConstants.STATE_HOME_DASHBOARD) {
                leftNavDashboardService.getTree();
            }
        }

        vm.displayTree = function(data) {
            $log.log("displayTree");
            $log.log(data);
        }

        leftNavDashboardService.addTreeCallback(vm.displayTree);
        $scope.$on('toggleLeftnav', vm.toggleLeftnav);
        vm.initialize();

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
