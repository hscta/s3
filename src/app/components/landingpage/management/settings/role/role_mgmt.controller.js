/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $q, $state,
                                intellicarAPI, settingsService, startupData,
                                $mdExpansionPanelGroup, schemaNewService,  $interval,
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


        var newSchema = [
            ["perm1", "SETTINGS_TAG_1", {
                // output => <input type="number">
                "key1": {
                    "type": "int", "displayname": "Display Name1", "displaydesc": "This will come in the hint",
                    "select": null, "editable": true, "default": null
                },


                // output => <input type="text">
                "key2": {
                    "type": "string", "displayname": "Display Name2", "displaydesc": "This will come in the hint",
                    "select": null, "editable": true, "default": null
                },

                // output => List of integers in items (Read only)
                "key3": {
                    "type": ["int"], "displayname": "Display Name3", "displaydesc": "This will come in the hint",
                    "select": null, "editable": false, "default": [1, 2, 3, 4, 5]
                },

                // output => List of strings in items (Read only)
                "key4": {
                    "type": ["string"], "displayname": "Display Name4", "displaydesc": "This will come in the hint",
                    "select": null, "editable": false, "default": ['a', 'b', 'c', 'd']
                },

                // output => List of integers in items
                "key5": {
                    "type": ["int"], "displayname": "Display Name3", "displaydesc": "This will come in the hint",
                    "select": null, "editable": true, "default": [1, 2, 3, 4, 5]
                },

                // output => List of strings in items
                "key6": {
                    "type": ["string"], "displayname": "Display Name4", "displaydesc": "This will come in the hint",
                    "select": null, "editable": true, "default": ['a', 'b', 'c', 'd']
                },

                // output => List of integers in items with checkboxes (no items are selected at this point in time)
                "key7": {
                    "type": ["int"], "displayname": "Display Name7", "displaydesc": "This will come in the hint",
                    "select": [0, 1, [1, 3, 9, 27, 81]],
                    "editable": true, "default": [3]
                },

                // output => List of strings in items with checkboxes (no items are selected at this point in time)
                "key8": {
                    "type": ["string"], "displayname": "Display Name8", "displaydesc": "This will come in the hint",
                    "select": [0, 10000, ['a', 'b', 'c']],
                    "editable": true, "default": ["b"]
                },

                // type is object
                "key5": {
                    "type": {
                        "level2key1": {
                            "type": "int", "displayname": "Level2 key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "string", "displayname": "Level2 key2", "default": "abc", "editable": true
                        }
                    },
                    "displayname": "Level 2 Keys Array",
                    "default": {"level2key1": 100, "level2key2": "200"},
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                },

                // type is [object]
                "key7": {
                    "type": [{
                        "level2key1": {
                            "type": "int", "displayname": "Level 2 Key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "string", "displayname": "Level 2 Key2", "default": "10", "editable": true
                        }
                    }],
                    "displayname": "Level 2 Keys Array",
                    "default": [{"level2key1": 100, "level2key2": "100"}, {"level2key1": 200, "level2key2": "200"}],
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                },


                // type is [[object]]
                "key8": {
                    "type": [
                        [
                            {
                                "level2key1": {
                                    "type": "int", "displayname": "Level 2 Key1", "default": 10, "editable": true
                                },
                                "level2key2": {
                                    "type": "string", "displayname": "Level 2 Key2", "default": "10", "editable": true
                                }
                            }
                        ]
                    ],
                    "displayname": "Level 2 Keys Array",
                    "default": [
                        [{"level2key1": 100, "level2key2": "100"}, {"level2key1": 200, "level2key2": "200"}],
                        [{"level2key1": 300, "level2key2": "300"}, {"level2key1": 400, "level2key2": "400"}]
                    ],
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                }

            }],
            ["perm2", "SETTINGS_TAG_2", {}]
        ];

        // var count = 4;
        //
        // vm.addOptions = function () {
        //     count++;
        //     schema[0].val.push('option'+count);
        //     $log.log(schema[0]);
        //     vm.fields = schemaService.parseSchema($scope, schema);
        // };


        vm.fields = schemaNewService.parseSchema(newSchema);

        $log.log(vm.fields);

        vm.onClickPanel = function(test) {
           // $log.log("open", test);
           // vm.addOptions();
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


