/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $q, $state,
                                intellicarAPI, settingsService, startupData,
                                $mdExpansionPanelGroup, schemaService,  $interval,
                                roleMgmtService) {
        $log.log('RoleMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.appConstants.ROLE);
        vm.data = [];


        vm.onLoad = function () {
            $log.log("my role data");
            $log.log(startupData);

            var i = 0;
            for (var key in startupData) {
                vm.details = {};
                if (startupData.hasOwnProperty(key)) {
                    $log.log(startupData[key]);
                    vm.details['name'] = startupData[key].name;
                    //vm.details['id'] = startupData[key].roleid;
                    vm.details['id'] = startupData[key].assetid;
                    vm.details['len'] = i++;
                    $log.log(vm.details);
                    vm.data.push(vm.details);
                    $scope = vm.data;
                }
            }
        };

        vm.addRole = function () {
            var details = {};
            details.len = vm.data.length;
            details.name = "new" + vm.data.length;
            vm.data.unshift(details);
        };

        vm.panelSchema = [{
            section:'vehicle Details',
            order:1,
            description:"vehicle description"
        },{
            section:"Devices",
            order:2,
            description:"device description"
        }];

        var schema = [
            {
                key:'fuelSelect',
                name:"fuelType",
                type:"select",
                val:["option1", "option2", "option3"],
                selcted_val:["option1"]
            }, {
                key:"modelSelect",
                name:"multiselect",
                type:"select",
                val:["option1", "option2", "option3"],
                selcted_val:["option1"],
                selection_type:"multiple"
            }, {
                key:"carSelect",
                name:"Car Number",
                type:"text"
            },
            // {
            //     key:"chassisSelect",
            //     name:"Chassis Number",
            //     type:"number"
            // }, {
            //     key:"emailSelect",
            //     name:"E-mail",
            //     type:"email"
            // }, {
            //     key:"checkboxSelect",
            //     name:"Checkbox Field",
            //     type:"checkbox",
            //     values:[]
            // },
        ];


        var schemaData = [{
            key: "fuelSelect",
            data: "option1"
        }, {
            key: "modelSelect",
            data: ["option1", "option2", "option3"]
        },{
            key:"carSelect",
            data:"KA 02 1234"
        }];

        var count = 4;

        vm.addOptions = function () {
            count++;
            schema[0].val.push('option'+count);
            $log.log(schema[0]);
            vm.fields = schemaService.parseSchema($scope, schema);
        };

        //$interval(vm.addOptions, 2000);

        $log.log(vm.fields);

        vm.onClickPanel = function(test) {
           // $log.log("open", test);
            vm.addOptions();
            var roleSchema = roleMgmtService.getDetails();
            //return schemaPromise;
            //var mydefer = $q.defer();
            //mydefer.resolve(schemaData);
            //var dataPromise = mydefer.promise;

            return $q.all([roleSchema, schemaData]);
            //     .then(function(resp) {$q.resolve(resp);}, function() {$log.log("Error");});
        }

        vm.onLoad();
    }
})();


