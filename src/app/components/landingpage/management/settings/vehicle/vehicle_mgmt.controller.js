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
     //   settingsService.setTab(intellicarAPI.constantFactory.VEHICLE);


        // $log.log('state.name = ');
        // $log.log($state);
        //vm.vehicle_details = [{'name':'maruti'}, {'name':'Suzuki'},{'name':'Yamaha'}]
        vm.data = [];

        vm.handleStartupData = function(resp) {
            $log.log(resp);
        };


        vm.handleStartupDataFailure = function(resp) {
            $log.log(resp);
        };

        vm.onLoad = function() {
            $log.log("my startup data");
            $log.log(startupData);

            for ( var key in startupData ){
                vm.details = {};
                if (startupData.hasOwnProperty(key)) {
                    //$log.log(key + " -> " + startupData[key].name);
                    vm.details['name'] = startupData[key].name;
                    //vm.details['id'] = startupData[key].vehicleid;
                    vm.details['id'] = startupData[key].assetid;
                    $log.log(vm.details);
                    vm.data.push(vm.details);
                    $scope = vm.data;
                }
            }
        };

        vm.onLoad();
    }


})();


