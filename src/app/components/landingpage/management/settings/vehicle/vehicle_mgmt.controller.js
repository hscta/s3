/**
 * Created by smiddela on 21/08/16.
 */


(function () {

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

        vm.handleStartupData = function (resp) {
            $log.log(resp);
        };


        vm.handleStartupDataFailure = function (resp) {
            $log.log(resp);
        };

        vm.onLoad = function () {
            // vm.data.push({name: "One", assetid: 1, assetpath: '1/1/1/17', type: 'vehicle'});
            // vm.data.push({name: "Two", assetid: 2, assetpath: '1/1/1/25', type: 'vehicle'});
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


            $log.log(startupData);
            vm.data = [];
            for (var key in startupData) {
                // var details = {};
                // details.type = 'vehicle';
                // details['name'] = startupData[key].name;
                // details['id'] = startupData[key].assetid;
                // $log.log(details);
                vm.data.push(startupData[key]);
            }
            $log.log(vm.data);
        };

        // vm.createPanel = function () {
        //     // vm.componentId = ($mdExpansionPanelGroup('vehicleGroup').count() + 1).toString();
        //     // $log.log(vm.componentId);
        //     // var details = {};
        //     // details.id = vm.componentId;
        //     // details.name = "new" + vm.data.length;
        //     //
        //     // vm.data.unshift(details);
        // };

        vm.onLoad();
    }
})();


