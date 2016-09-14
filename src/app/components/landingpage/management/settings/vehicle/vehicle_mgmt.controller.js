/**
 * Created by smiddela on 21/08/16.
 */


(function () {

    angular
        .module('uiplatform')
        .controller('VehicleMgmtController', VehicleMgmtController);

    function VehicleMgmtController($scope, $log, startupData,
                                   intellicarAPI, settingsService) {
        $log.log('VehicleMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.VEHICLE);
        var vm = this;
        vm.assets = [];

        vm.handleStartupData = function (resp) {
            $log.log(resp);
        };


        vm.handleStartupDataFailure = function (resp) {
            $log.log(resp);
        };

        vm.onLoad = function () {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                vm.assets.push(startupData[key]);
            }

            $log.log(vm.assets);
        };

        vm.onLoad();
    }
})();


// vm.assets.push({name: "One", assetid: 1, assetpath: '1/1/1/17', type: 'vehicle'});
// vm.assets.push({name: "Two", assetid: 2, assetpath: '1/1/1/25', type: 'vehicle'});
//
// $log.log("my vehicle data");
// //$log.log(startupData);
//
// vm.schema = intellicarAPI.schemaService.getSchema();
// $log.log(vm.schema);
//
// vm.schemaData = intellicarAPI.schemaService.getSchemaData();
// $log.log(vm.schemaData);
//
// intellicarAPI.schemaService.bindDataToSchema(vm.schema, vm.schemaData);
// $log.log(vm.schema);


