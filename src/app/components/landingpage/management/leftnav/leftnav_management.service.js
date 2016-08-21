/**
 * Created by smiddela on 13/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavManagementService', function($log, $q, intellicarAPI) {
            $log.log("leftNavManagementService");

            var vm = this;
            vm.listeners = {};

            vm.handleResponse = function(resp) {
                $log.log("leftNavManagementService handleResponse");
                $log.log(resp);
                return $q.resolve(resp);
            };

            vm.handleFailure = function(resp) {
                $log.log("leftNavManagementService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.processManagedVehicles = function(resp) {
                $log.log(resp);
                if(resp.data === null || resp.data.data === null) {
                    return $q.reject(resp);
                    //vm.listeners['getMyVehiclesManage'](null);
                }

                var data = resp.data.data;
                $log.log(data);
                for(var vidx in data.vehicles) {
                    var vehicle = data.vehicles[vidx];
                    vehicle.permissions = [];
                    for(var pidx in data.permissions) {
                        var permission = data.permissions[pidx];
                        if(vehicle.vehicleid === permission.vehicleid) {
                            vehicle.permissions.push(permission);
                        }
                    }
                }

                return $q.resolve(data.vehicles);
            }

            vm.getMyVehicleTree = function(body) {
                intellicarAPI.userService.getMyVehicleTree(body)
                    .then(vm.listeners['getMyVehicleTree'], vm.handleFailure);
            };

            vm.getMyVehiclesManage = function(body) {
                return intellicarAPI.userService.getMyVehiclesManage(body)
                    .then(vm.processManagedVehicles, vm.handleFailure);
            };

            vm.addListener = function(key, listener) {
                vm.listeners[key] = listener;
            };

        });
})();


// vm.treeCallback = null;
// vm.handleResponse = function(resp) {
//     $log.log("handleResponse");
//     $log.log(resp);
//     if(vm.treeCallback != null)
//         vm.treeCallback(resp);
//     //return $q.resolve(resp)
// };
//
// vm.handleFailure = function(resp) {
//     $log.log("handleFailure ");
//     $log.log(resp);
//     return $q.reject(resp);
// };
//
// vm.getMyVehicles = function(body) {
//     intellicarAPI.userService.getMyVehicles(body)
//         .then(vm.handleResponse, vm.handleFailure);
// };
//
// vm.addTreeCallback = function(callback) {
//     vm.treeCallback = callback;
// }
