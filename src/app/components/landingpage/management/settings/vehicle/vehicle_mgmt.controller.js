/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('VehicleMgmtController', VehicleMgmtController);

    function VehicleMgmtController($scope, $rootScope, $log, $state, startupData,
                                   intellicarAPI, settingsService) {
        $log.log('VehicleMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.constantFactory.VEHICLE);


        // $log.log('state.name = ');
        // $log.log($state);
        vm.vehicle_details = [{'name':'maruti'}, {'name':'Suzuki'},{'name':'Yamaha'}]

        vm.handleStartupData = function(resp) {
            $log.log(resp);
        };


        vm.handleStartupDataFailure = function(resp) {
            $log.log(resp);
        };

        vm.onLoad = function() {
            //$log.log("my startup data");
            $log.log(startupData);
        };

        vm.onLoad();
    }


})();


