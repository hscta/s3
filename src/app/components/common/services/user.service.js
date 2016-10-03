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


        vm.getMyInfo = function (body) {
            //$log.log("getMyInfo");
            return requestService.firePost('/user/myinfo', body);
        };

        vm.getMyGroups = function (body) {
            // $log.log("getMyGroups");
            return requestService.firePost('/user/mygroups', body);
        };


        vm.getMyAssetGroups = function (body) {
            // $log.log("getMyAssetGroups");
            return requestService.firePost('/user/myassetgroups', body);
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


        vm.createUser = function (body) {
            return requestService.firePost('/user/create', body);
        };


        vm.getMyFences = function (body) {
            return requestService.firePost('/user/mygeofences', body);
        };


        vm.getMyGeofenceReports = function (body) {
            return requestService.firePost('/user/mygeofencereports', body);
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


        vm.getMyFencesMap = function (body) {
            // $log.log("getMyFencesMap");
            return vm.getMyFences(body)
                .then(helperService.mergeAssetPermissions, vm.handleFailure)
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
            $log.log(resp);
            return $q.resolve(resp);
        };


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
