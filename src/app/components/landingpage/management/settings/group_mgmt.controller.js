/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('GroupMgmtController', GroupMgmtController);

    function GroupMgmtController($scope, $rootScope, $log, groupService, $state, $location,
                            intellicarAPI, $mdExpansionPanel) {

        $log.log('GroupMgmtController');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);

        vm.handleMyVehicles = function(data) {
            $log.log("GroupMgmtController handleMyVehicles");
            $log.log(data);

            vm.data = data;
        };

        vm.handleMyVehiclesFailure = function(data) {
            $log.log("GroupMgmtController handleMyVehiclesFailure");
        };

        vm.onGroupClick = function() {
            groupService.getMyVehicles({group:{grouppath: '/1/1'}})
                .then(vm.handleMyVehicles, vm.handleMyVehiclesFailure);

        }

        //vm.onGroupClick();

        vm.toggle_on_panel = function (myfunc) {
            $log.log('click event');
            myfunc();
        }

        vm.test = function(event, data) {
            vm.info = data.info;
            $log.log(vm.info);

            $location.hash('bottom');

            // call $anchorScroll()
           // anchorSmoothScrollService.scrollTo('sss');
            intellicarAPI.anchorScrollService.scrollTo('sss');
            $mdExpansionPanel().waitFor('panel').then(function (instance) {
                instance.expand();
            });


        }

        $scope.$on('test', vm.test);

    }
})();


