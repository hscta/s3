/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('Tab2Controller', Tab2Controller);

    function Tab2Controller($scope, $rootScope, $log, tab2Service, $state, $location,
                            intellicarAPI, $mdExpansionPanel) {

        $log.log('Tab2Controller');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);

        vm.handleMyVehicles = function(data) {
            $log.log("Tab2Controller handleMyVehicles");
            $log.log(data);

            vm.data = data;
        };

        vm.handleMyVehiclesFailure = function(data) {
            $log.log("Tab2Controller handleMyVehiclesFailure");
        };

        vm.onGroupClick = function() {
            tab2Service.getMyVehicles({group:{grouppath: '/1/1'}})
                .then(vm.handleMyVehicles, vm.handleMyVehiclesFailure);

        }

        vm.onGroupClick();

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
            $mdExpansionPanel().waitFor('panell').then(function (instance) {
                instance.expand();
            });


        }

        $scope.$on('test', vm.test);

    }
})();


