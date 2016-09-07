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

            var len = 0;
            for ( var key in startupData ){
                var details = {};
                if (startupData.hasOwnProperty(key)) {
                    $log.log(startupData[key]);
                    details.type='vehicle';
                    details['name'] = startupData[key].name;
                    //vm.details['id'] = startupData[key].vehicleid;
                    details['id'] = startupData[key].assetid;
                    vm.details['len'] = i++;
                    $log.log(details);
                    vm.data.push(details);
                    //$scope = vm.data;
                }
            }
        };

        // scope.panelSchema = [{
        //     section:'vehicle Details',
        //     order:1,
        //     description:"vehicle description"
        // },{
        //     section:"Devices",
        //     order:2,
        //     description:"device description"
        // }];

        var schema = [
            {
                name:"fuelType",
                type:"select",
                val:["option1", "option2", "option3"],
                selcted_val:["option1"]
            }, {
                name:"multiselect",
                type:"select",
                val:["option1", "option2", "option3"],
                selcted_val:["option1"],
                selection_type:"multiple"
            }, {
                name:"Car Number",
                type:"text"
            }, {
                name:"Chassis Number",
                type:"number"
            }, {
                name:"E-mail",
                type:"email"
            }
        ];

        vm.createPanel = function () {
            var details = {};
            details.len = vm.data.length;
            details.name = "new" + vm.data.length;
            vm.data.unshift(details);
        };
        vm.onLoad();
    }
})();


