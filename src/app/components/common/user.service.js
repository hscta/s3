/**
 * Created by smiddela on 19/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userService', userService);

    function userService($rootScope, $log, $q, requestService, helperService) {
        var vm = this;
        $log.log("userService");


        vm.getMyGroups = function(body) {
            // $log.log("getMyGroups");
            return requestService.firePost('/user/mygroups', body);
        };


        vm.getMyVehicles = function (body) {
            // $log.log("getMyVehicles");
            return requestService.firePost('/user/myvehicles', body);
        };


        vm.getMyUsers = function (body) {
            // $log.log("getMyUsers");
            return requestService.firePost('/user/myusers', body);
        };


        vm.getMyRoles = function (body) {
            // $log.log("getMyRoles");
            return requestService.firePost('/user/myroles', body);
        };


        vm.getMyDevices = function (body) {
            // $log.log("getMyDevices");
            return requestService.firePost('/user/mydevices', body);
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
                // .then(helperService.mergeGroupPermissions, vm.handleFailure)
                // .then(helperService.makeGroupMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyVehiclesMap = function (body) {
            // $log.log("getMyVehiclesMap");
            return vm.getMyVehicles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                // .then(helperService.mergeVehiclePermissions, vm.handleFailure)
                // .then(helperService.makeVehicleMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyUsersMap = function (body) {
            // $log.log("getMyUsersMap");
            return vm.getMyUsers(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                // .then(helperService.mergeUserPermissions, vm.handleFailure)
                // .then(helperService.makeUserMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };



        vm.getMyRolesMap = function (body) {
            // $log.log("getMyRolesMap");
            return vm.getMyRoles(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                // .then(helperService.mergeRolePermissions, vm.handleFailure)
                // .then(helperService.makeRoleMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyDevicesMap = function (body) {
            // $log.log("getMyDevicesMap");
            return vm.getMyDevices(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
                .then(helperService.makeAssetMap, vm.handleFailure)
                // .then(helperService.mergeDevicePermissions, vm.handleFailure)
                // .then(helperService.makeDeviceMap, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.handleDirectAssetResponse = function(resp) {
            // $log.log("handleDirectAssetResponse");
            $log.log(resp);
            return $q.resolve(resp);
        };


        vm.getMyDirectAssetsMap = function (body) {
            // $log.log("getMyDirectAssetsMap");
            var gPromise = vm.getMyGroupsMap(body);
            var vPromise = vm.getMyVehiclesMap(body);
            var uPromise = vm.getMyUsersMap(body);
            var rPromise = vm.getMyRolesMap(body);
            var dPromise = vm.getMyDevicesMap(body);

            return $q.all([gPromise, vPromise, uPromise, rPromise, dPromise])
                .then(vm.handleDirectAssetResponse, vm.handleFailure);

        };
    }
})();
