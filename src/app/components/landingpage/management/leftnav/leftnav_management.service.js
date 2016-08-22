/**
 * Created by smiddela on 13/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavManagementService', function ($log, $q, intellicarAPI) {
            $log.log("leftNavManagementService");

            var vm = this;
            vm.listeners = {};

            vm.handleResponse = function (resp) {
                $log.log("leftNavManagementService handleResponse");
                $log.log(resp);
                return $q.resolve(resp);
            };

            vm.handleFailure = function (resp) {
                $log.log("leftNavManagementService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            // function nth_occurrence (string, char, nth) {
            //     var first_index = string.indexOf(char);
            //     var length_up_to_first_index = first_index + 1;
            //
            //     if (nth == 1) {
            //         return first_index;
            //     } else {
            //         var string_after_first_occurrence = string.slice(length_up_to_first_index);
            //         var next_occurrence = nth_occurrence(string_after_first_occurrence, char, nth - 1);
            //
            //         if (next_occurrence === -1) {
            //             return -1;
            //         } else {
            //             return length_up_to_first_index + next_occurrence;
            //         }
            //     }
            // }

            function getNextPathItemEnd(str, start) {
                //$log.log(str.substring(start));
                var slash = '/';

                if (str === null)
                    return -1;

                if (start === null)
                    start = 0;

                if (start < 0 || start >= str.length)
                    return -1;

                if (str.charAt(start) !== slash)
                    return -1;

                if (str.substr(start, str.length).length < 4)
                    return -1;

                //var mysub = str.index(start + 1, str.length);
                //$log.log("mysub = " + mysub);
                var firstSlash = str.indexOf(slash, start + 1);
                //$log.log(firstSlash);
                //$log.log(start + 1);
                if (firstSlash != -1 && firstSlash < str.length - 1) {
                    var secondSlash = str.indexOf(slash, firstSlash + 1);
                    if (secondSlash != -1) {
                        return secondSlash - 1;
                    } else {
                        return str.length - 1;
                    }
                }

                return -1;
            }


            vm.getNodesInPath = function (path) {
                var nodesInPath = [];
                var startIndex = 0;
                var endIndex = 0;
                var itemStartIndex = 0;
                //$log.log("==================" + path);
                while (itemStartIndex < path.length) {
                    endIndex = getNextPathItemEnd(path, itemStartIndex);
                    if (endIndex == -1)
                        return null;
                    //$log.log("endIndex " + endIndex);
                    if (endIndex < path.length) {
                        nodesInPath.push(path.substring(startIndex, endIndex + 1));
                    }
                    itemStartIndex = endIndex + 1;
                }
                //$log.log(nodesInPath);
                return nodesInPath;
            };


            vm.getManagedVehicleTree = function (data) {
                vm.mergeVehiclePermissions(data);

                var vehicles = data.vehicles;
                var vehicleTree = {};
                for (var vidx in vehicles) {
                    var vehicle = vehicles[vidx];
                    var nodesInPath = vm.getNodesInPath(vehicle.vehiclepath);
                    for (var nidx in nodesInPath) {
                        var nodePath = nodesInPath[nidx];
                        if (!(nodePath in vehicleTree))
                            vehicleTree[nodePath] = {};
                        vehicleTree[nodePath].info = null;
                        vehicleTree[nodePath].children = {};
                        if(nidx == 1) {
                            vehicleTree[nodesInPath[0]].children[nodePath] = {};
                        }
                    }
                }
                //$log.log(vehicleTree);

                for (vidx in vehicles) {
                    vehicle = vehicles[vidx];
                    if (!(vehicle.pgrouppath in vehicleTree)) {
                        $log.log("Deadly mistake");
                        continue;
                    }

                    if (!(vehicle.vehiclepath in vehicleTree)) {
                        $log.log("Another Deadly mistake");
                        continue;
                    }

                    vehicleTree[vehicle.vehiclepath].info = vehicle;
                    if (vehicleTree[vehicle.pgrouppath].children === null) {
                        vehicleTree[vehicle.pgrouppath].children = {};
                    }
                    vehicleTree[vehicle.pgrouppath].children[vehicle.vehiclepath] = vehicle;
                }

                $log.log(vehicleTree);
                return vehicleTree;
            };

            vm.mergeVehiclePermissions = function (data) {
                for (var vidx in data.vehicles) {
                    var vehicle = data.vehicles[vidx];
                    vehicle.permissions = [];
                    for (var pidx in data.permissions) {
                        var permission = data.permissions[pidx];
                        if (vehicle.vehicleid === permission.vehicleid) {
                            vehicle.permissions.push(permission);
                        }
                    }
                }
            }

            vm.processManagedVehicles = function (resp) {
                $log.log(resp);
                if (resp.data === null || resp.data.data === null) {
                    return $q.reject(resp);
                    //vm.listeners['getMyVehiclesManage'](null);
                }

                //var data = resp.data.data;
                //vm.mergeVehiclePermissions(data);
                $log.log(resp.data.data);

                var managedVehicleTree = vm.getManagedVehicleTree(resp.data.data);
                return $q.resolve(managedVehicleTree);
            };

            // vm.getMyVehicleTree = function(body) {
            //     intellicarAPI.userService.getMyVehicleTree(body)
            //         .then(vm.listeners['getMyVehicleTree'], vm.handleFailure);
            // };

            vm.getMyVehiclesManage = function (body) {
                return intellicarAPI.userService.getMyVehiclesManage(body)
                    .then(vm.processManagedVehicles, vm.handleFailure);
            };

            vm.addListener = function (key, listener) {
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
