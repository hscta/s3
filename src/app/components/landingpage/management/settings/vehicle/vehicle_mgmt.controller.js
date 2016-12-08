/**
 * Created by smiddela on 21/08/16.
 */


(function () {

    angular
        .module('uiplatform')
        .controller('VehicleMgmtController', VehicleMgmtController);

    function VehicleMgmtController($scope, $rootScope, $log, intellicarAPI, settingsService,
                                   vehicleMgmtService) {
        $log.log('VehicleMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.VEHICLE);
        var vm = this;
        vm.assets = [];
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;

        vm.currentGroupAsset = settingsService.lastGroup;

        vm.handleStartupData = function (startupData) {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                vm.assets.push(startupData[key]);
            }

            // $log.log(vm.assets);

            if (settingsService.getCurrentGroupPath() )
                vm.showBtn = true;
        };


        vm.handleStartupDataFailure = function (resp) {
            $log.log(resp);
        };


        vm.init = function (currentGroup) {
            vehicleMgmtService.getData(settingsService.getCurrentGroup())
                .then(vm.handleStartupData, vm.handleStartupDataFailure);
        };


        vm.showNewVehicleField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
            vm.msg = ""
        };


        if ( settingsService.getCurrentGroup()){
            vm.assets = [];
            vm.init();
        }
        // $scope.$on('loadVehicleMgmt', vm.init);
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


