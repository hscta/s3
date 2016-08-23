/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('Tab2Controller', Tab2Controller);

    function Tab2Controller($scope, $rootScope, $log, tab2Service, $state) {

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

        vm.test = function (myfunc) {
            $log.log('click event');
            myfunc();
        }
    }
})();


