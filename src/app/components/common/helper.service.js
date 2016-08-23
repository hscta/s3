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
            //$log.log("vm.mergeVehiclePermissions");
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
            //$log.log("vm.mergeGroupPermissions");
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
    }
})();
