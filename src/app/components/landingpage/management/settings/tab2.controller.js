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

        vm.handleMyVehicleWEditView = function(data) {
            $log.log("Tab2Controller handleMyVehicleWEditView");
            $log.log(data);

            vm.data = data;
        };

        vm.handleMyVehicleWEditViewFailure = function(data) {
            $log.log("Tab2Controller handleMyVehicleWEditViewFailure");
        };

        vm.onGroupClick = function() {
            tab2Service.getMyVehicleWEditView({toService:{pgrouppath: '/1/1/1/7'}})
                .then(vm.handleMyVehicleWEditView, vm.handleMyVehicleWEditViewFailure);

        }

        vm.onGroupClick();

        vm.test = function (myfunc) {
            $log.log('click event');
            myfunc();
        }
    }
})();


