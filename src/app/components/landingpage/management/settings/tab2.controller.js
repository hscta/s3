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
        };

        vm.handleMyVehicleWEditViewFailure = function(data) {
            $log.log("Tab2Controller handleMyVehicleWEditViewFailure");
        };

        vm.onGroupClick = function() {
            tab2Service.getMyVehicleWEditView({})
                .then(vm.handleMyVehicleWEditView, vm.handleMyVehicleWEditViewFailure);

        }

        vm.onGroupClick();
    }
})();


