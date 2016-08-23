/**
 * Created by smiddela on 19/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userService', userService);

    function userService($rootScope, $log, $q, requestService) {
        var vm = this;
        $log.log("userService");

        vm.handleResponse = function (resp) {
            //$log.log("userService handleResponse");
            return $q.resolve(resp)
        };

        vm.handleFailure = function (resp) {
            //$log.log("userService handleFailure ");
            return $q.reject(resp);
        };

        vm.getMyVehicleTree = function (body) {
            $log.log("userService getMyVehicleTree");
            return requestService.firePost('/user/myvehicles', body)
                .then(vm.handleResponse, vm.handleFailure);

        };

        vm.mergeVehiclePermissions = function (resp) {
            var data = resp.data.data;
            for (var idx in data.vehicles) {
                var vehicle = data.vehicles[idx];
                vehicle.ui_asset_type = 'vehicle';
                vehicle.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (vehicle.vehicleid === permission.vehicleid) {
                        vehicle.permissions.push(permission);
                    }
                }
            }

            return $q.resolve(resp);
        };


        vm.mergeGroupPermissions = function (resp) {
            var data = resp.data.data;
            for (var idx in data.groups) {
                var group = data.groups[idx];
                group.ui_asset_type = 'group';
                group.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (group.groupid === permission.groupid) {
                        group.permissions.push(permission);
                    }
                }
            }

            return $q.resolve(resp);
        };

        vm.getMyGroups = function(body) {
            $log.log("userService getMyGroups");
            return requestService.firePost('/user/mygroups', body)
                .then(vm.mergeGroupPermissions, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        }

        vm.getMyVehicles = function (body) {
            $log.log("userService getMyVehicles");
            return requestService.firePost('/user/myvehicles', body)
                .then(vm.mergeVehiclePermissions, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };
    }
})();
