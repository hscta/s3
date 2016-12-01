/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $q,
                                intellicarAPI, settingsService, startupData,
                                roleMgmtService, permissionService, $mdDialog) {
        $log.log('RoleMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.ROLE);
        var vm = this;
        vm.assets = [];
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;
        vm.currentGroupAsset = settingsService.lastGroup;


        vm.ASSIGN_PERMISSION = 12;

        vm.assignPermissionSuccess = function(resp){
            $log.log(resp);
        };


        vm.showNewRoleField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
        };

        vm.addPermission = function(data){

            var body = {
                grouppath:'/1/1'
            }

            var s = intellicarAPI.treeDataService.getManagementTree(body);

            $log.log(s);

            vm.selectedGrouppath = data.assetpath;

            var body ={
                grouppath:data.assetpath
            };
            vm.getPermissions(body);
        };


        vm.getPermissions = function(body) {
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
            // $log.log( resp);
            // var assignablePermList = resp[0].data.data.vdmap;
            // var assignedPermList = resp[1].data.data.vdmap;
            //
            // $scope.groupData.datas[0].list = [];
            //
            // $scope.groupData.datas[1].list = [];
            // $scope.groupData.datas[1].list = assignedPermList;
            //
            // var matching = false;
            // for ( var idx in assignablePermList){
            //     for ( var perm in assignedPermList ) {
            //         if (assignablePermList[idx].permid == assignedPermList[perm].permid){
            //             matching = true;
            //             break;
            //         }else {
            //             matching = false;
            //         }
            //     }
            //
            //     if ( !matching ) {
            //         $scope.groupData.datas[1].list.push(assignablePermList[idx])
            //     }
            // }
            //
            // $log.log($scope.groupData.datas);
            // $scope.groupData.visible = true;
        };


        vm.createRole = function () {
            $log.log(vm.currentGroupAsset);

            name = vm.newRoleName;
            pgrouppath = vm.currentGroupAsset.assetpath;
            var body = {
                name : name,
                pgrouppath: pgrouppath
            };


            intellicarAPI.roleService.createRole(body)
                .then(vm.createRoleSuccess, vm.handleFailure);

        };


        vm.createRoleSuccess = function (resp) {
            $log.log(resp);
        };


        vm.init = function () {
            // $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                if ( startupData[key].permissions.indexOf(vm.ASSIGN_PERMISSION)>=0){
                    startupData[key].assignPermission = true;
                }else {
                    startupData[key].assignPermission = false;
                }
                vm.assets.push(startupData[key]);
            }

            // $log.log(vm.assets);
            if ( settingsService.getCurrentGroupPath() )
                vm.showBtn = true;

            if (vm.currentGroupAsset) {
                if (vm.currentGroupAsset.permissions.indexOf(vm.ASSIGN_USER_PERM) != 0)
                    vm.currentGroupAsset.assignUser = true;

                if (vm.currentGroupAsset.permissions.indexOf(vm.ASSIGN_ROLE_PERM) != 0)
                    vm.currentGroupAsset.assignRole = true;

            }

        };

        vm.init();
    }
})();


