/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('VehicleMgmtController', VehicleMgmtController);

    function VehicleMgmtController($scope, $rootScope, $log, $state, startupData,
                                   intellicarAPI, settingsService, $mdExpansionPanelGroup,
                                    $compile) {
        $log.log('VehicleMgmtController');
        var vm = this;
     //   settingsService.setTab(intellicarAPI.appConstants.VEHICLE);


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
            $log.log("my vehicle data");
            $log.log(startupData);

            for ( var key in startupData ){
                var details = {};
                if (startupData.hasOwnProperty(key)) {
                    //$log.log(key + " -> " + startupData[key].name);
                    details.type='vehicle';
                    details['name'] = startupData[key].name;
                    //vm.details['id'] = startupData[key].vehicleid;
                    details['id'] = startupData[key].assetid;
                    $log.log(details);
                    vm.data.push(details);
                    //$scope = vm.data;
                }
            }
        };

        vm.createPanel = function () {
            var details = {};
            details.id = vm.componentId;
            details.name = "new" + vm.data.length;
            vm.data.unshift(details);
        };
        vm.onLoad();
    }
})();


