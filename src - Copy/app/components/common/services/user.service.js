/**
 * Created by smiddela on 19/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userService', userService);

    function userService($rootScope, $log, $q, requestService, helperService) {
        $log.log("userService");
        var vm = this;

        vm.encloseBody = function (data) {
            // return data;
            return {user: data};
        };


        vm.getMyInfo = function (body) {
            //$log.log("getMyInfo");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/myinfo', body);
        };


        vm.getMyGroups = function (body) {
            // $log.log("getMyGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/mygroups', body);
        };


        vm.getMyAssignedGroups = function (body) {
            // $log.log("getMyGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/myassignedgroups', body);
        };


        vm.getMyAssetGroups = function (body) {
            // $log.log("getMyAssetGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/myassetgroups', body);
        };


        vm.getMyVehicles = function (body) {
            // $log.log("getMyVehicles");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/myvehicles', body);
        };


        vm.getMyUsers = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/user/myusers', body);
        };


        vm.getUserPermissions = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/permission/map', body);
        };


        vm.getMyRoles = function (body) {
            // $log.log("getMyRoles");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/myroles', body);
        };


        vm.getMyDevices = function (body) {
            // $log.log("getMyDevices");
            body = vm.encloseBody(body);
            return requestService.firePost('/user/mydevices', body);
        };


        vm.createUser = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/user/create', body);
        };


        vm.getMyFences = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/user/mygeofences', body);
        };


        vm.getMyFenceInfos = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/user/mygeofenceinfos', body);
        };


        vm.getMyGeofenceReports = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/user/mygeofencereports', body);
        };


        vm.assignUser = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/user/assigngroup', body);
        };


        vm.handleResponse = function (resp) {
            //$log.log("handleResponse");
            return $q.resolve(resp)
        };


        vm.handleFailure = function (resp) {
            //$log.log("handleFailure ");
            return $q.reject(resp);
        };


        vm.getMyInfoMap = function (body) {
            return vm.getMyInfo(body)
                .then(helperService.makeMapOnAssetPath, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyGroupsMap = function (body) {
            // $log.log("getMyGroupsMap");
            return vm.getMyGroups(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyAssignedGroupsMap = function (body) {
            // $log.log("getMyGroupsMap");
            return vm.getMyAssignedGroups(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyAssetGroupsMap = function (body) {
            //$log.log("getMyAssetGroupsMap");
            return vm.getMyAssetGroups(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyVehiclesMap = function (body) {
            // $log.log("getMyVehiclesMap");
            return vm.getMyVehicles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyUsersMap = function (body) {
            // $log.log("getMyUsersMap");
            return vm.getMyUsers(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };

        vm.getMyUsersMapList = function (body) {
            // $log.log("getMyRolesMap");
            return vm.getMyUsers(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetList, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyRolesMap = function (body) {
            // $log.log("getMyRolesMap");
            return vm.getMyRoles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyRolesList = function (body) {
            // $log.log("getMyRolesMap");
            return vm.getMyRoles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetList, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyDevicesMap = function (body) {
            // $log.log("getMyDevicesMap");
            return vm.getMyDevices(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyFencesMap = function (body) {
            // $log.log("getMyFencesMap");
            return vm.getMyFences(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyFenceInfosMap = function (body) {
            // $log.log("getMyFenceInfosMap");
            return vm.getMyFenceInfos(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.mergeFenceInfo, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyGeofenceReportsMap = function (body) {
            return vm.getMyGeofenceReports(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.handleDirectAssetResponse = function (resp) {
            //$log.log("userService handleDirectAssetResponse");
            // $log.log(resp);
            return $q.resolve(resp);
        };


        // vm.getUsersWithPermissions = function(body){
        //     var users = vm.getMyUsers(body);
        //     var permissions = vm.getUserPermissions(body);
        //
        //
        //     return $q.all([users, permissions])
        //         .then(vm.handleDirectAssetResponse, vm.handleFailure)
        //         .then(helperService.mergeUserPermissions,  vm.handleFailure)
        //         .then(vm.handleResponse, vm.handleFailure);
        // };


        vm.getMyDirectAssetsMap = function (body) {
            // $log.log("userService getMyDirectAssetsMap");
            var gPromise = vm.getMyGroupsMap(body);
            var vPromise = vm.getMyVehiclesMap(body);
            var uPromise = vm.getMyUsersMap(body);
            var rPromise = vm.getMyRolesMap(body);
            var dPromise = vm.getMyDevicesMap(body);
            var myPromise = vm.getMyInfoMap(body);

            return $q.all([gPromise, vPromise, uPromise, rPromise, dPromise, myPromise])
                .then(vm.handleDirectAssetResponse, vm.handleFailure);

        };
    }
})();
