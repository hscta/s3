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

    function LeftNavDashboardController($scope,$rootScope, navService, $mdSidenav, $log, $document, leftnavService, requestService) {

        $log.log('LeftNavDashboardController');
        var vm = this;


        vm.toggleLeftnav = function(event, data) {

            $log.log('dashboard navvvvvvvv ')
            vm.dummy = data.dummy;
        }

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
