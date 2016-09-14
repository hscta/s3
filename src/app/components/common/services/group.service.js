/**
 * Created by smiddela on 19/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('groupService', groupService);

    function groupService($rootScope, $log, $q, requestService, helperService) {
        var vm = this;
        $log.log("groupService");

        vm.createGroup = function(body) {
            // $log.log("getMyGroups");
            return requestService.firePost('/group/create', body);
        };

        vm.getMyGroups = function(body) {
            // $log.log("getMyGroups");
            return requestService.firePost('/group/mygroups', body);
        };


        vm.getMyAssetGroups = function (body) {
            // $log.log("getMyAssetGroups");
            return requestService.firePost('/group/myassetgroups', body);
        };


        vm.getMyVehicles = function (body) {
            // $log.log("getMyVehicles");
            return requestService.firePost('/group/myvehicles', body);
        };


        vm.getMyUsers = function (body) {
            // $log.log("getMyUsers");
            return requestService.firePost('/group/myusers', body);
        };


        vm.getMyRoles = function (body) {
            // $log.log("getMyRoles");
            return requestService.firePost('/group/myroles', body);
        };


        vm.getMyDevices = function (body) {
            // $log.log("getMyDevices");
            return requestService.firePost('/group/mydevices', body);
        };


        vm.createGroup = function(body) {
            return requestService.firePost('/group/create', body);
        };


        vm.assignRole = function(body) {
            return requestService.firePost('/group/assignrole', body);
        };


        vm.handleResponse = function (resp) {
            //$log.log("handleResponse");
            return $q.resolve(resp)
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



        vm.getMyRolesMap = function (body) {
            // $log.log("getMyRolesMap");
            return vm.getMyRoles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
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
