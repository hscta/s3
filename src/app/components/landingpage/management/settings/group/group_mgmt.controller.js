/**
 * Created by smiddela on 21/08/16.
 */


(function () {

    angular
        .module('uiplatform')
        .controller('GroupMgmtController', GroupMgmtController);
    
    function GroupMgmtController($scope, $rootScope, $log,
                                 intellicarAPI, groupMgmtService,$timeout,
                                 settingsService, startupData, $q, $stateParams) {

        $log.log('GroupMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.GROUP);
        var vm = this;
        vm.assets = [];
        vm.newGroup = {};
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;

        vm.handleMyVehiclesFailure = function (data) {
            $log.log("GroupMgmtController handleMyVehiclesFailure");
        };

        vm.onLoad = function () {
            $log.log(startupData);
            vm.panelData(startupData);


            //
            // window.setTimeout(function(){
            //     var newData = groupMgmtService.getData((settingsService.getCurrentGroup()));
            //
            //     $log.log(newData);
            //     $log.log($q.resolve(newData));
            // }, 5000);

        };

        vm.panelData = function (data) {
            vm.assets = [];
            for (var key in data) {
                vm.assets.push(data[key]);
            }

            if (settingsService.getCurrentGroupPath())
                vm.showBtn = true;
        };

        vm.createGroup = function () {
            vm.groupBtnStatus = true;
            groupMgmtService.createGroup(vm.newGroup)
                .then(function (resp) {
                        $log.log(resp);
                        vm.newGroup = {};
                        $rootScope.$broadcast('EVENT_MGMT_TREE_CHANGE', {});
                        vm.groupBtnStatus = false;
                        vm.msg = "Group created Successfully.";
                        groupMgmtService.getData($stateParams).then(
                            function (resp) {
                                vm.panelData(resp);
                            }
                        );
                    },
                    function (resp) {
                        $log.log("CREATE GROUP FAILED");
                        $log.log(resp);
                        vm.groupBtnStatus = false;
                        vm.msg = "Failed to create group."
                    });
        };

        vm.showNewGroupField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
            vm.msg = ""
        };

        // Standard popup object

        $scope.groupData = { 
            // visible : true,
            heading: 'Add User to the Group',
            options:{
                width: 70, // in  percentage
                height: 70, // in percentage
            }, 

            datas:[
                {
                    heading:'Assigned Users',
                    list :[
                        {id:1, name:'Rahul'},
                        {id:2, name:'Pratheek'},
                        {id:3, name:'Rajive'},
                        {id:4, name:'Binoy reddy'}, 
                    ], 
                    buttons:[
                        {iconType:'fa', icon: 'trash', color: '#e74c3c', fColor: '#fff', onClick : function(data, func){

                            func(data, function(processGUI){

                                // Fire api

                                $timeout(function(){
                                    processGUI(1);
                                },1000);
                            
                            });
                        }},
                    ]
                }, 
                {
                    heading:'Assignable Users',
                    list :[
                        {id:5, name:'Roy jhonson'},
                        {id:6, name:'Bravo'},
                        {id:7, name:'Steven'},
                    ], 
                    buttons:[
                        {iconType:'fa', icon: 'plus', color: '#2ecc71', fColor: '#fff', onClick : function(data, func){

                            func(data, function(processGUI){

                                // Fire api

                                $timeout(function(){
                                    processGUI(-1);
                                },1000);
                            
                            });

                        }},
                    ]
                }, 
            ],
        }
 
        vm.addUsers = function (data) {
            $scope.groupData.visible = true;
            $scope.groupData.heading = 'Add Users to the group';
            var temp = angular.copy($scope.groupData.datas);
            $scope.groupData.datas = [];
            $timeout(function () {
                $scope.groupData.datas = temp;
            },2000);
        }

        vm.addRoles = function (data) {
            $scope.groupData.visible = true;
            $scope.groupData.heading = 'Add Roles to the group';
        }
 
        vm.onLoad();
    } 
})();


