/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('GroupMgmtController', GroupMgmtController);

    function GroupMgmtController($scope, $rootScope, $log,
                                 intellicarAPI, groupMgmtService, $timeout,
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
        vm.ASSIGN_ROLE_PERM = 5;


        vm.handleMyVehiclesFailure = function (data) {
            $log.log("GroupMgmtController handleMyVehiclesFailure");
        };

        // vm.selectedTreeGroup = null;

        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
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
            options: {
                width: 70, // in  percentage
                height: 70 // in percentage
            },
            datas: [
                {
                    heading: 'Assigned Users',
                    list: [],
                    buttons: [
                        {
                            iconType: 'fa',
                            icon: 'trash',
                            color: '#e74c3c',
                            fColor: '#fff',
                            onClick: function (data, func) {
                                func(data, function (processGUI) {
                                    // Fire api
                                    $log.log('deasssign');
                                    $log.log(data);

                                    $timeout(function () {
                                        processGUI(1);
                                    }, 1000);
                                });
                            }
                        },
                    ]
                }, {
                    heading: 'Assignable Users',
                    list: [],
                    buttons: [
                        {
                            iconType: 'fa',
                            icon: 'plus',
                            color: '#2ecc71',
                            fColor: '#fff',
                            onClick: function (data, func) {
                                func(data, function (processGUI) {
                                    // Fire api
                                    $log.log('Asssign');
                                    $log.log(data);
                                    var userpath = data.item.assetpath;

                                    var body = {
                                        grouppath: vm.selectedGrouppath,
                                        userpath: userpath
                                    };

                                    // intellicarAPI.userService.assignUser(body)
                                    //     .then(vm.assignUserSuccess, vm.handleFailure);

                                    $log.log(body);
                                    $timeout(function () {
                                        processGUI(-1);
                                    }, 1000);
                                });
                            }
                        },
                    ]
                },
            ],
        };

        vm.assignUserSuccess = function (resp) {
            $log.log(resp);
        };


        vm.assignUsers = function (data) {
            $log.log(data);
            vm.selectedGrouppath = data.assetpath;

            var body = {
                grouppath: data.assetpath
            };
            vm.getUsers(body);

            $scope.groupData.datas[1].heading = "Assignable Users";
            $scope.groupData.datas[0].heading = "Assigned Users";
        };

        vm.assignRoles = function (data) {
            // $scope.groupData.visible = true;
            $scope.groupData.heading = 'Add Roles to the group';
            vm.selectedGrouppath = data.assetpath;

            var body = {
                grouppath: data.assetpath
            };

            $scope.groupData.datas[1].buttons = [
                {
                    iconType: 'fa', icon: 'plus', color: '#2ecc71', fColor: '#fff', onClick: function (data, func) {
                    func(data, function (processGUI) {
                        // Fire api
                        $log.log('Asssign Role');
                        $log.log(data);
                        var userpath = data.item.assetpath;

                        var body = {
                            grouppath: vm.selectedGrouppath,
                            userpath: userpath
                        };

                        $log.log(body);
                        $timeout(function () {
                            processGUI(-1);
                        }, 1000);
                    });
                }
                },
            ];

            $scope.groupData.datas[1].heading = "Assignable Roles";
            $scope.groupData.datas[0].heading = "Assigned Roles";
            vm.getRoles(body);
        };

        vm.getUsers = function (body) {
            var users = intellicarAPI.userService.getMyUsersMapList({});

            var groupUsers = intellicarAPI.groupService.getMyUsersMapList(body);

            return $q.all([users, groupUsers])
                .then(vm.handleUsersResponse, vm.handleFailure);
        };

        vm.handleUsersResponse = function (resp) {
            $log.log(resp);

            vm.setData(resp, vm.ASSIGN_USER_PERM);
        };

        vm.getRoles = function (body) {
            var userRoles = intellicarAPI.userService.getMyRolesList({});

            var groupRoles = intellicarAPI.groupService.getMyRolesList(body);

            return $q.all([userRoles, groupRoles])
                .then(vm.handleRolesResponse, vm.handleFailure);
        };

        vm.handleRolesResponse = function (resp) {
            vm.setData(resp, vm.ASSIGN_ROLE_PERM);
        };

        vm.setData = function (resp, permission) {
            $scope.groupData.datas[0].list = [];
            $scope.groupData.datas[1].list = [];

            $scope.groupData.datas[0].list = resp[1];

            var userRole = resp[1];
            var matching = false;
            for (var idx in resp[0]) {
                for (var role in resp[1]) {
                    if (resp[0][idx].assetpath == resp[1][role].assetpath) {
                        matching = true;
                        break;
                    } else {
                        matching = false;
                    }
                }
                if (!matching) {
                    if (resp[0][idx].permissions.indexOf(permission) >= 0) {
                        $scope.groupData.datas[1].list.push(resp[0][idx]);
                    }
                }
            }

            $log.log($scope.groupData.datas);
            $scope.groupData.visible = true;
        };


        vm.panelData = function (data) {
            vm.assets = [];
            for (var key in data) {
                vm.assets.push(data[key]);
            }

            if (settingsService.getCurrentGroupPath())
                vm.showBtn = true;
        };


        vm.init = function () {
            $log.log(startupData);

            for (var idx in startupData) {
                startupData[idx].assignUser = false;
                if (startupData[idx].permissions.indexOf(vm.ASSIGN_USER_PERM) != -1)
                    startupData[idx].assignUser = true;

                startupData[idx].assignRole = false;
                if (startupData[idx].permissions.indexOf(vm.ASSIGN_ROLE_PERM) != -1)
                    startupData[idx].assignRole = true;
            }

            vm.panelData(startupData);

            //
            // window.setTimeout(function(){
            //     var newData = groupMgmtService.getData((settingsService.getCurrentGroup()));
            //
            //     $log.log(newData);
            //     $log.log($q.resolve(newData));
            // }, 5000);

            $log.log($stateParams);

            // vm.selectedTreeGroup= $stateParams.info;

            // vm.currentGroupAsset = settingsService.getCurrentGroupPath();
            //
            // if (vm.currentGroupAsset) {
            //     if (vm.currentGroupAsset.permissions.indexOf(vm.ASSIGN_USER_PERM) != 0)
            //         vm.currentGroupAsset.assignUser = true;
            //
            //     if (vm.currentGroupAsset.permissions.indexOf(vm.ASSIGN_ROLE_PERM) != 0)
            //         vm.currentGroupAsset.assignRole = true;
            //
            // }


        };


        vm.init();
    }
})();


