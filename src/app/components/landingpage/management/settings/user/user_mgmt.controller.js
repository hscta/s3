/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('UserMgmtController', UserMgmtController);

    function UserMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, userMgmtService,
                                settingsService, startupData, $q) {

        $log.log('UserMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.USER);
        var vm = this;
        vm.assets = [];
        vm.newUser = {};
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;

        vm.currentGroupAsset = settingsService.lastGroup;

        vm.ASSIGN_GROUP_PERM = 10;
        vm.ASSIGN_ROLE_PERM = 5;

        $scope.groupData = {
            // visible : true,
            heading: '',
            options:{
                width: 70, // in  percentage
                height: 70 // in percentage
            },
            datas:[
                {
                    heading:'',
                    list :[],
                    buttons:[
                        {iconType:'fa', icon: 'trash', color: '#e74c3c', fColor: '#fff', onClick : function(data, func){
                            func(data, function(processGUI){
                                // Fire api
                                $log.log('deasssign');
                                $log.log(data);

                                processGUI(1);
                            });
                        }},
                    ]
                },{
                    heading:'',
                    list :[],
                    buttons:[
                        {iconType:'fa', icon: 'plus', color: '#2ecc71', fColor: '#fff', onClick : function(data, func){
                            func(data, function(processGUI){
                                // Fire api
                                $log.log('Asssign');
                                $log.log(data);
                                var userpath = data.item.assetpath;

                                var body = {
                                    grouppath:vm.selectedGrouppath,
                                    userpath:userpath
                                };
                                $log.log(body);
                                processGUI(-1);
                            });
                        }},
                    ]
                },
            ],
        };


        vm.init = function () {
            vm.assets = [];
            for (var key in startupData) {
                vm.assets.push(startupData[key]);
            }

            $log.log(vm.assets);

            if ( settingsService.getCurrentGroupPath() )
                vm.showBtn = true;


            for ( var idx in startupData){
                if (startupData[idx].permissions.indexOf(vm.ASSIGN_GROUP_PERM)>= 0 )
                    startupData[idx].assignGroup = true;
                else
                    startupData[idx].assignGroup = false;

                if (startupData[idx].permissions.indexOf(vm.ASSIGN_ROLE_PERM)>= 0 )
                    startupData[idx].assignRole = true;
                else
                    startupData[idx].assignRole = false;
            }


            if (vm.currentGroupAsset) {
                if (vm.currentGroupAsset.permissions.indexOf(vm.ASSIGN_GROUP_PERM) != 0)
                    vm.currentGroupAsset.assignGroup = true;

                if (vm.currentGroupAsset.permissions.indexOf(vm.ASSIGN_ROLE_PERM) != 0)
                    vm.currentGroupAsset.assignRole = true;

            }

            $log.log(startupData);
        };


        vm.createUser = function () {
            if (vm.newUser.password === vm.confirmPassword) {
                userMgmtService.createUser(vm.newUser)
                    .then(function (resp) {
                            $log.log(resp);
                            vm.newUser = {};
                            vm.confirmPassword = '';
                            $rootScope.$broadcast('EVENT_MGMT_TREE_CHANGE', {});
                            vm.errorMsg = "User created successfully."
                        },
                        function (resp) {
                            $log.log("CREATE USER FAILED");
                            $log.log(resp);
                            vm.errorMsg = "Failed to create user."
                        });
            }else {
                vm.errorMsg = "Passwords do not match";
                return;
            }
        };

        vm.showNewUserField = function () {
            $log.log('show/hide');
            vm.errorMsg = ""
            vm.isdiplay = !vm.isdiplay;
        };

        vm.assignGroups = function(data){
            $log.log(data);
            $scope.groupData.heading = "Assign Groups to Users";

            var body ={
                grouppath:data.assetpath
            };
            vm.getUsers(body);
        };


        vm.getUsers = function(body) {
            $scope.groupData.datas[1].heading = "Assignable Groups";
            $scope.groupData.datas[0].heading = "Assigned Groups";

            var users = intellicarAPI.userService.getMyUsersMapList({});

            var groupUsers = intellicarAPI.groupService.getMyUsersMapList(body);

            return $q.all([users, groupUsers])
                .then(vm.handleUsersResponse, vm.handleFailure);
        };

        vm.handleUsersResponse = function(resp){
            $log.log(resp);

            vm.setData(resp, vm.ASSIGN_USER_PERM);
        };


        vm.assignRoles = function (data) {
            $log.log(data);
            // $scope.groupData.visible = true;
            $scope.groupData.heading = 'Assign Roles to Users';
            vm.selectedGrouppath = data.assetpath;

            var body ={
                grouppath:data.assetpath
            };

            $scope.groupData.datas[1].buttons = [
                {iconType:'fa', icon: 'plus', color: '#2ecc71', fColor: '#fff', onClick : function(data, func){
                    func(data, function(processGUI){
                        // Fire api
                        $log.log('Asssign Role');
                        $log.log(data);
                        var userpath = data.item.assetpath;

                        var body = {
                            grouppath:vm.selectedGrouppath,
                            userpath:userpath
                        };

                        processGUI(-1);
                    });
                }},
            ];

            vm.getRoles(body);
        };

        vm.getRoles = function(body){
            var userRoles = intellicarAPI.userService.getMyRolesList({});

            var groupRoles = intellicarAPI.groupService.getMyRolesList(body);

            return $q.all([userRoles, groupRoles])
                .then(vm.handleRolesResponse, vm.handleFailure);
        };


        vm.handleRolesResponse = function (resp) {
            vm.setData(resp, vm.ASSIGN_ROLE_PERM);
            $scope.groupData.datas[1].heading = "Assignable Roles";
            $scope.groupData.datas[0].heading = "Assigned Roles";
        };


        vm.setData = function(resp, permission){
            $scope.groupData.datas[0].list = [];
            $scope.groupData.datas[1].list = [];

            $scope.groupData.datas[0].list = resp[1];

            var userRole = resp[1];
            var matching = false;
            for( var idx in resp[0] ) {
                for ( var role in resp[1] ) {
                    if ( resp[0][idx].assetpath == resp[1][role].assetpath){
                        matching = true;
                        break;
                    }else {
                        matching = false;
                    }
                }
                if ( !matching ) {
                    if ( resp[0][idx].permissions.indexOf(permission) >= 0 ) {
                        $scope.groupData.datas[1].list.push(resp[0][idx]);
                    }
                }
            }

            $log.log($scope.groupData.datas);
            $scope.groupData.visible = true;
        };

        vm.init();
    }
})();


