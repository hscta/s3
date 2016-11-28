/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $q,
                                intellicarAPI, settingsService, startupData,
                                roleMgmtService, permissionService) {
        $log.log('RoleMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.ROLE);
        var vm = this;
        vm.assets = [];
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;
        vm.currentGroupAsset = settingsService.lastGroup;


        vm.ASSIGN_PERMISSION = 12;

        $scope.groupData = {
            // visible : true,
            heading: 'Add User to the Group',
            options:{
                width: 70, // in  percentage
                height: 70 // in percentage
            },
            datas:[
                {
                    heading:'Assigned Users',
                    list :[],
                    buttons:[
                        {iconType:'fa', icon: 'trash', color: '#e74c3c', fColor: '#fff', onClick : function(data, func){
                            func(data, function(processGUI){
                                // Fire api
                                $log.log('deasssign');
                                $log.log(data);
                                var userpath = data.item.assetpath;

                                var body = {
                                    grouppath:vm.selectedGrouppath,
                                    userpath:userpath
                                };

                                // intellicarAPI.roleService.removePermission(body)
                                //     .then(vm.assignPermissinSuccess, vm.handleFailure);


                                processGUI(1);
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
                                $log.log('Asssign');
                                $log.log(data);
                                var userpath = data.item.assetpath;

                                var body = {
                                    grouppath:vm.selectedGrouppath,
                                    userpath:userpath
                                };

                                // intellicarAPI.roleService.assignPermission(body)
                                //     .then(vm.assignPermissinSuccess, vm.handleFailure);

                                $log.log(body);
                                processGUI(-1);
                            });
                        }},
                    ]
                },
            ],
        };

        vm.assignPermissionSuccess = function(resp){
            $log.log(resp);
        };


        vm.onLoad = function () {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                if ( startupData[key].permissions.indexOf(vm.ASSIGN_PERMISSION)>=0){
                    startupData[key].assignPermission = true;
                }else {
                    startupData[key].assignPermission = false;
                }
                    vm.assets.push(startupData[key]);
            }

            $log.log(vm.assets);
            if ( settingsService.getCurrentGroupPath() )
                vm.showBtn = true;
        };

        vm.showNewRoleField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
        };

        vm.addPermission = function(data){
            vm.selectedGrouppath = data.assetpath;

            var body ={
                grouppath:data.assetpath
            };
            vm.getPermissions(body);
        };


        vm.getPermissions = function(body) {
            $scope.groupData.datas[1].heading = "Assignable Permissions";
            $scope.groupData.datas[0].heading = "Assigned Permissions";


            var permissions = intellicarAPI.permissionService.permissionMap({});

            var assignedPerm = intellicarAPI.permissionService.permissionMap({});

            return $q.all([permissions, assignedPerm])
                .then(vm.handleUsersResponse, vm.handleFailure);
        };


        vm.handleUsersResponse = function(resp){
            $log.log(resp);
            vm.setData(resp, vm.ASSIGN_PERMISSION);
        };

        vm.setData = function(resp, permission){
            $log.log( resp);
            var assignablePermList = resp[0].data.data.vdmap;
            var assignedPermList = resp[1].data.data.vdmap;

            $scope.groupData.datas[0].list = [];

            $scope.groupData.datas[1].list = [];
            $scope.groupData.datas[0].list = assignedPermList;

            var matching = false;
            for ( var idx in assignablePermList){
                for ( var perm in assignedPermList ) {
                    if (assignablePermList[idx].permid == assignedPermList[perm].permid){
                        matching = true;
                        break;
                    }else {
                        matching = false;
                    }
                }

                if ( !matching ) {
                    $scope.groupData.datas[1].list.push(assignablePermList[idx])
                }
            }

            $log.log($scope.groupData.datas);
            $scope.groupData.visible = true;
        };

        vm.onLoad();
    }
})();


