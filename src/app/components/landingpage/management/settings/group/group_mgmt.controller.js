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

        vm.ASSIGN_USER_PERM = 10;

        vm.handleMyVehiclesFailure = function (data) {
            $log.log("GroupMgmtController handleMyVehiclesFailure");
        };



        vm.onLoad = function () {
            $log.log(startupData);

            for ( var idx in startupData){
                if (startupData[idx].permissions.indexOf(vm.ASSIGN_USER_PERM)>= 0 ){
                    startupData[idx].assignUser = true;
                }else
                    startupData[idx].assignUser = false;

            }
            vm.panelData(startupData);


            //
            // window.setTimeout(function(){
            //     var newData = groupMgmtService.getData((settingsService.getCurrentGroup()));
            //
            //     $log.log(newData);
            //     $log.log($q.resolve(newData));
            // }, 5000);

            intellicarAPI.userService.getMyUsersMap({})
                .then(vm.getMyUsers, vm.handleFailure );
        };

        vm.getMyUsers = function(resp){
            $scope.groupData.datas.list = [];

            vm.users = resp;
        };

        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
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
                    list :[],
                    buttons:[
                        {iconType:'fa', icon: 'trash', color: '#e74c3c', fColor: '#fff', onClick : function(data, func){

                            func(data, function(processGUI){
                                // Fire api
                                $log.log('asssign');
                                $log.log(data);

                                $timeout(function(){
                                    processGUI(1);
                                },1000);

                            });
                        }},
                    ]
                },{
                    heading:'Assignable Users',
                    list :[],
                    buttons:[
                        {iconType:'fa', icon: 'plus', color: '#2ecc71', fColor: '#fff', onClick : function(data, func){
                            func(data, function(processGUI){
                                // Fire api
                                $log.log('deasssign');
                                $log.log(data);
                                var userpath = data.item.assetpath;

                                var body = {
                                    user: {
                                        grouppath:vm.selectedGrouppath,
                                        userpath:userpath
                                    }
                                };

                                $log.log(body);
                                //
                                // intellicarAPI.userService.assignUser(body)
                                //     .then(handleSuccess, handleFailure);

                                $timeout(function(){
                                    processGUI(-1);
                                },1000);
                            });
                        }},
                    ]
                },
            ],
        };

        vm.handleSuccess = function(resp){
            $log.log(resp);
        }

        vm.getGroupUsers = function(resp){
            // $log.log(resp);

            for ( var idx in resp ) {
                $scope.groupData.datas[0].list.push({
                    id: resp[idx].assetid,
                    assetpath: resp[idx].assetpath,
                    assetlevel: resp[idx].assetlevel,
                    name: resp[idx].name,
                    permissions: resp[idx].permissions,
                    pgroupid: resp[idx].pgroupid,
                    pgrouppath: resp[idx].pgrouppath,
                    pname: resp[idx].pname,
                    ui_asset_type: resp[idx].ui_asset_type
                });
            }

            for ( var idx in vm.users ) {
                if (!resp.hasOwnProperty(idx)){
                    if ( vm.users[idx].permissions.indexOf(vm.ASSIGN_USER_PERM) >= 0 ){
                        $scope.groupData.datas[1].list.push({
                            id: vm.users[idx].assetid,
                            assetpath: vm.users[idx].assetpath,
                            assetlevel: vm.users[idx].assetlevel,
                            name: vm.users[idx].name,
                            permissions: vm.users[idx].permissions,
                            pgroupid: vm.users[idx].pgroupid,
                            pgrouppath: vm.users[idx].pgrouppath,
                            pname: vm.users[idx].pname,
                            ui_asset_type: vm.users[idx].ui_asset_type
                        });
                    }
                }
            }
            $scope.groupData.visible = true;
            $scope.groupData.heading = 'Add Users to the group';
            var temp = angular.copy($scope.groupData.datas);
            // $scope.groupData.datas = [];
            $timeout(function () {
                $scope.groupData.datas = temp;
            },2000);
        };


        vm.addUsers = function (data) {
            $log.log(data);

            var grouppath = data.pgrouppath;

            var body ={
                group:{
                    grouppath:grouppath
                }
            };

            vm.selectedGrouppath = data.assetpath;

            intellicarAPI.groupService.getMyUsersMap(body)
                .then(vm.getGroupUsers, vm.handleFailure );
        };


        vm.addRoles = function (data) {
            $scope.groupData.visible = true;
            $scope.groupData.heading = 'Add Roles to the group';
        }

        vm.onLoad(); 
    }
})();


