/**
 * Created by smiddela on 23/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('helperService', helperService);

    function helperService($rootScope, $log, $q) {
        var vm = this;
        $log.log("helperService");


        vm.mergeVehiclePermissions = function (resp) {
            $log.log("vm.mergeVehiclePermissions");
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
            $log.log("vm.mergeGroupPermissions");
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

        vm.mergeUserPermissions = function (resp) {
            $log.log("vm.mergeUserPermissions");
            var data = resp.data.data;
            for (var idx in data.users) {
                var user = data.users[idx];
                user.ui_asset_type = 'user';
                user.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (user.userid === permission.userid) {
                        user.permissions.push(permission);
                    }
                }
            }

            return $q.resolve(resp);
        };


        vm.mergeRolePermissions = function (resp) {
            $log.log("vm.mergeRolePermissions");
            var data = resp.data.data;
            for (var idx in data.roles) {
                var role = data.roles[idx];
                role.ui_asset_type = 'role';
                role.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (role.roleid === permission.roleid) {
                        role.permissions.push(permission);
                    }
                }
            }

            return $q.resolve(resp);
        };


        vm.mergeDevicePermissions = function (resp) {
            $log.log("vm.mergeDevicePermissions");
            var data = resp.data.data;
            for (var idx in data.devices) {
                var device = data.devices[idx];
                device.ui_asset_type = 'device';
                device.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (device.deviceid === permission.deviceid) {
                        device.permissions.push(permission);
                    }
                }
            }

            return $q.resolve(resp);
        };


        vm.makeGroupMap = function(resp) {
            var data = resp.data.data;
            var groups = {};
            for(var idx in data.groups) {
                var group = data.groups[idx];
                groups[group.grouppath] = group;
            }
            return $q.resolve(groups);
        };


        vm.makeVehicleMap = function(resp) {
            var data = resp.data.data;
            var vehicles = {};
            for(var idx in data.vehicles) {
                var vehicle = data.vehicles[idx];
                vehicles[vehicle.vehiclepath] = vehicle;
            }
            return $q.resolve(vehicles);
        };


        vm.makeUserMap = function(resp) {
            var data = resp.data.data;
            var users = {};
            for(var idx in data.users) {
                var user = data.users[idx];
                users[user.userpath] = user;
            }
            return $q.resolve(users);
        };


        vm.makeRoleMap = function(resp) {
            var data = resp.data.data;
            var roles = {};
            for(var idx in data.roles) {
                var role = data.roles[idx];
                roles[role.rolepath] = role;
            }
            return $q.resolve(roles);
        };


        vm.makeDeviceMap = function(resp) {
            var data = resp.data.data;
            var devices = {};
            for(var idx in data.devices) {
                var device = data.devices[idx];
                devices[device.devicepath] = device;
            }
            return $q.resolve(devices);
        };
    }
})();
