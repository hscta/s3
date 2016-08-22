/**
 * Created by smiddela on 08/08/16.
 */
(function () {

    'use strict';

    angular
        .module('uiplatform')
        .service('treeDataService', treeDataService);

    function treeDataService($log, $q, userService) {
        var vm = this;
        $log.log("treeDataService");

        vm.management_tree_data = function (data) {
            console.log(data.data.data);
            var nodes = data.data.data;
            var map = {}, node, roots = [];
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.checkStatus = 'unchecked';
                node.nodes = [];
                var group_id = node.pgrouppath.split('/');
                group_id.shift();
                var pgroupid;
                var real_groupid = [];
                var tgroupid;

                for (var j = 0; j < group_id.length; j++) {
                    if (!(j % 2 == 0))
                        real_groupid.push(group_id[j]);
                }
                tgroupid = real_groupid[real_groupid.length - 1];
                if (real_groupid.length <= 1)
                    pgroupid = tgroupid;
                else
                    pgroupid = real_groupid[real_groupid.length - 2];

                map[tgroupid] = i;
                if (pgroupid != tgroupid) {
                    nodes[map[pgroupid]].nodes.push(node);
                } else {
                    roots.push(node);
                }
            }
            return roots;
        };

        // vm.dashboard_tree_data = function(data) {
        //     console.log(data.data.data);
        //     var nodes = data.data.data;
        //     var map = {}, node, roots = [];
        //     for (var i = 0; i < nodes.length; i += 1) {
        //         node = nodes[i];
        //         node.nodes = [];
        //         map[node.vehicleid] = i; // use map to look-up the parents
        //         if (node.pgroupid != node.vehicleid) {
        //                 nodes[map[node.pgroupid]].nodes.push(node);
        //         } else {
        //             roots.push(node);
        //         }
        //     }
        //     console.log(roots);
        //     return roots;
        // };


        vm.getNextPathItemEnd = function (str, start) {
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

            var firstSlash = str.indexOf(slash, start + 1);
            if (firstSlash != -1 && firstSlash < str.length - 1) {
                var secondSlash = str.indexOf(slash, firstSlash + 1);
                if (secondSlash != -1) {
                    return secondSlash - 1;
                } else {
                    return str.length - 1;
                }
            }

            return -1;
        };


        vm.getNodesInPath = function (path) {
            var nodesInPath = [];
            var startIndex = 0;
            var endIndex = 0;
            var itemStartIndex = 0;
            //$log.log("==================" + path);
            while (itemStartIndex < path.length) {
                endIndex = vm.getNextPathItemEnd(path, itemStartIndex);
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
        };


        vm.getMyVehicleTree = function (myVehicles, myGroups) {
            vm.mergeVehiclePermissions(myVehicles);

            var vehicles = myVehicles.vehicles;
            var vehicleTree = {};
            for (var vidx in vehicles) {
                var vehicle = vehicles[vidx];
                vehicle.ui_asset_type = 'vehicle';
                var nodesInPath = vm.getNodesInPath(vehicle.vehiclepath);
                for (var nidx in nodesInPath) {
                    var nodePath = nodesInPath[nidx];
                    if (!(nodePath in vehicleTree))
                        vehicleTree[nodePath] = {};
                    vehicleTree[nodePath].info = null;
                    vehicleTree[nodePath].children = null;

                    if (nodePath in myGroups) {
                        vehicleTree[nodePath].info = myGroups[nodePath];

                        if (nidx > 0 && nidx < nodesInPath.length) {
                            if (vehicleTree[nodesInPath[nidx - 1]].children === null) {
                                vehicleTree[nodesInPath[nidx - 1]].children = {};
                            }
                            vehicleTree[nodesInPath[nidx - 1]].children[nodePath] = myGroups[nodePath];
                        }
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

            //$log.log(vehicleTree);
            return vehicleTree;
        };

        vm.processMyGroups = function (groupsResp) {
            var myGroups = {};
            for (var idx in groupsResp) {
                var mygroup = groupsResp[idx];
                mygroup.ui_asset_type = 'group';
                myGroups[mygroup.grouppath] = mygroup;
            }
            return myGroups;
        };

        vm.processMyVehicles = function (resp) {
            //$log.log(resp);
            var vehiclesResp = resp[0].data.data;
            var groupsResp = resp[1].data.data;
            var myGroups = vm.processMyGroups(groupsResp);
            var vehicleTree = vm.getMyVehicleTree(vehiclesResp, myGroups);
            return $q.resolve(vehicleTree);
        };

        vm.getTreeMyVehiclesManage = function (body) {
            var vehiclesPromise = userService.getMyVehiclesManage(body);
            var groupsPromise = userService.getMyGroups(body);
            return $q.all([vehiclesPromise, groupsPromise])
                .then(vm.processMyVehicles, vm.handleFailure);
        };

        vm.getTreeMyVehiclesDash = function (body) {
            var vehiclesPromise = userService.getMyVehiclesDash(body);
            var groupsPromise = userService.getMyGroups(body);
            return $q.all([vehiclesPromise, groupsPromise])
                .then(vm.processMyVehicles, vm.handleFailure);
        };


    }

})();

