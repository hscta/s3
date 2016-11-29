/**
 * Created by smiddela on 19/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('groupService', groupService);

    function groupService($rootScope, $log, $q, requestService, helperService, userService) {
        $log.log("groupService");
        var vm = this;

        vm.encloseBody = function (data) {
            // return data;
            return {group:data};
        };


        vm.getMyGroups = function(body) {
            // $log.log("getMyGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/mygroups', body);
        };


        vm.getMyAssetGroups = function (body) {
            // $log.log("getMyAssetGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/myassetgroups', body);
        };


        vm.getMyVehicles = function (body) {
            // $log.log("getMyVehicles");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/myvehicles', body);
        };


        vm.getMyUsers = function (body) {
            // $log.log("getMyUsers");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/myusers', body);
        };

        vm.getAssignedUsers = function (body) {
            // $log.log("getMyUsers");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/assignedusers', body);
        };


        vm.getMyRoles = function (body) {
            // $log.log("getMyRoles");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/myroles', body);
        };


        vm.getAssignedRoles = function (body) {
            // $log.log("getMyRoles");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/assignedroles', body);
        };


        vm.getMyDevices = function (body) {
            // $log.log("getMyDevices");
            body = vm.encloseBody(body);
            return requestService.firePost('/group/mydevices', body);
        };


        vm.createGroup = function(body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/group/create', body);
        };


        vm.assignRole = function(body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/group/assignrole', body);
        };


        vm.deAssignRole = function(body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/group/deassignrole', body);
        };


        vm.handleResponse = function (resp) {
            //$log.log("handleResponse");
            return $q.resolve(resp);
        };


        vm.handleFailure = function (resp) {
            //$log.log("handleFailure ");
            return $q.reject(resp);
        };


        vm.getMyGroupsMap = function(body) {
            // $log.log("getMyGroupsMap");
            return vm.getMyGroups(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyAssetGroupsMap = function(body) {
            //$log.log("getMyAssetGroupsMap");
            return vm.getMyAssetGroups(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyVehiclesMap = function (body) {
            //$log.log("getMyVehiclesMap");
            return vm.getMyVehicles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyUsersMap = function (body) {
            //$log.log("getMyUsersMap");
            return vm.getMyUsers(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };

        vm.getMyUsersMapList = function (body) {
            //$log.log("getMyUsersMap");
            return vm.getMyUsers(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetList, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getAssignedUsersMapList = function (body) {
            //$log.log("getMyUsersMap");
            return vm.getAssignedUsers(body)
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

        vm.getAssignedRolesList = function (body) {
            // $log.log("getMyRolesMap");
            return vm.getAssignedRoles(body)
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


        vm.handleDirectAssetResponse = function(resp) {
            $log.log("groupService handleDirectAssetResponse");
            $log.log(resp);
            return $q.resolve(resp);
        };


        vm.getMyDirectAssetsMapWithUser = function (body) {
            //$log.log("groupService getMyDirectAssetsMap");
            var gPromise = vm.getMyGroupsMap(body);
            var vPromise = vm.getMyVehiclesMap(body);
            var uPromise = vm.getMyUsersMap(body);
            var rPromise = vm.getMyRolesMap(body);
            var dPromise = vm.getMyDevicesMap(body);
            var myPromise = userService.getMyInfoMap(body);

            return $q.all([gPromise, vPromise, uPromise, rPromise, dPromise, myPromise])
                .then(vm.handleDirectAssetResponse, vm.handleFailure);

        };


        vm.getMyDirectAssetsMap = function (body) {
            //$log.log("groupService getMyDirectAssetsMap");
            var gPromise = vm.getMyGroupsMap(body);
            var vPromise = vm.getMyVehiclesMap(body);
            var uPromise = vm.getMyUsersMap(body);
            var rPromise = vm.getMyRolesMap(body);
            var dPromise = vm.getMyDevicesMap(body);

            return $q.all([gPromise, vPromise, uPromise, rPromise, dPromise])
                .then(vm.handleDirectAssetResponse, vm.handleFailure);

        };


        vm.createNewGroup = function (groupName){
            $log.log(groupName);
            return 'success';
        } ;
    }
})();
