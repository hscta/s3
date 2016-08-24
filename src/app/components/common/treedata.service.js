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


        vm.buildUITree = function (genericTree, key) {
            //$log.log("buildTree " + key);

            if (genericTree === null)
                return null;

            if (genericTree[key].visited == true) {
                //$log.log("Already visited: " + key);
                return null;
            }

            var gtNode = genericTree[key];
            gtNode.visited = true;

            //$log.log(gtNode);
            var utNode = {};
            utNode.id = key;
            utNode.title = gtNode.info.name;
            utNode.info = gtNode.info;
            utNode.items = [];
            utNode.checkStatus = false;
            utNode.collapsed = false;

            var resultNode = null;
            var child = null;
            if (gtNode.children !== null) {
                for (var idx in gtNode.children) {
                    child = gtNode.children[idx];
                    //$log.log("parent: " + key + ", child = " + idx);
                    resultNode = vm.buildUITree(genericTree, vm.getAssetPath(child));

                    // if (child.ui_asset_type == "group") {
                    //     //$log.log("inside group " + child.grouppath);
                    //     resultNode = vm.buildUITree(genericTree, child.grouppath);
                    // } else if (child.ui_asset_type == "vehicle") {
                    //     //$log.log("inside vehicle " + child.vehiclepath);
                    //     resultNode = vm.buildUITree(genericTree, child.vehiclepath);
                    // }

                    if (resultNode !== null) {
                        utNode.items.push(resultNode);
                    }
                }
            }

            return utNode;
        };


        vm.createUITree = function (genericTree) {
            //$log.log(genericTree);

            var uiTree = [];
            for (var key in genericTree) {
                var resultNode = vm.buildUITree(genericTree, key);
                if (resultNode !== null) {
                    uiTree.push(resultNode);
                }
            }
            return $q.resolve(uiTree);
        };


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
            if(path === undefined)
                return [];

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



        // vm.getGenericTreeVehicles = function (body) {
        //     var vehiclesPromise = userService.getMyVehicles(body);
        //     var groupsPromise = userService.getMyGroups(body);
        //     return $q.all([vehiclesPromise, groupsPromise])
        //         .then(vm.createGenericTree, vm.handleFailure);
        // };


        vm.getDashboardTree = function (body) {
            var groupsPromise = userService.getMyGroupsMap(body);
            var vehiclesPromise = userService.getMyVehiclesMap(body);
            return $q.all([groupsPromise, vehiclesPromise])
                .then(vm.createGenericTree2, vm.handleFailure)
                .then(vm.createUITree, vm.handleFailure);
        };


        vm.getAssetPath = function(asset) {
            if(asset.ui_asset_type == "group")
                return asset.grouppath;
            else if(asset.ui_asset_type == "user")
                return asset.userpath;
            else if(asset.ui_asset_type == "role")
                return asset.rolepath;
            else if(asset.ui_asset_type == "vehicle")
                return asset.vehiclepath;
            else if(asset.ui_asset_type == "device")
                return asset.devicepath;
        };


        vm.buildUITree2 = function (genericTree, key) {
            $log.log("buildTree2 " + key);

            if (genericTree === null)
                return null;

            if (genericTree[key].visited == true) {
                //$log.log("Already visited: " + key);
                return null;
            }

            var gtNode = genericTree[key];
            gtNode.visited = true;

            //$log.log(gtNode);
            var utNode = {};
            utNode.id = key;
            utNode.title = gtNode.info.name;
            utNode.info = gtNode.info;
            utNode.items = [];
            utNode.checkStatus = false;
            utNode.collapsed = false;

            var resultNode = null;
            var child = null;
            if (gtNode.children !== null) {
                for (var idx in gtNode.children) {
                    child = gtNode.children[idx];
                    $log.log("parent: " + key + ", child = " + idx + ", type = " + child.ui_asset_type);
                    resultNode = vm.buildUITree2(genericTree, vm.getAssetPath(child));
                    $log.log(resultNode);

                    // if (resultNode !== null) {
                    //     utNode.items.push(resultNode);
                    // }


                    if (resultNode !== null) {
                        var assetTypeExists = false;
                        for(var uidx in utNode.items) {
                            var assetType = utNode.items[uidx];
                            $log.log(assetType.title + " == " + resultNode.info.ui_asset_type);
                            if (assetType.title == resultNode.info.ui_asset_type) {
                                $log.log("assetTypeExists ");
                                assetTypeExists = true;
                                break;
                            }
                        }

                        if(!assetTypeExists) {
                            $log.log("assetType does not Exists");
                            assetType = {
                                id: resultNode.info.ui_asset_type,
                                title: resultNode.info.ui_asset_type,
                                info: {name: resultNode.info.ui_asset_type + 's'},
                                items: []
                            };
                            // assetType.id = resultNode.info.ui_asset_type;
                            // assetType.title = resultNode.info.ui_asset_type;
                            // assetType.info = {}
                            // assetType.items = [];
                            utNode.items.push(assetType);
                            $log.log(assetType);
                        }
                        assetType.items.push(resultNode);
                    }
                }
            }

            return utNode;
        };


        vm.createUITree2 = function (genericTree) {
            //$log.log(genericTree);

            var uiTree = [];
            for (var key in genericTree) {
                var resultNode = vm.buildUITree2(genericTree, key);
                if (resultNode !== null) {
                    uiTree.push(resultNode);
                }
            }
            return $q.resolve(uiTree);
        };


        vm.createGenericTree2 = function (resp) {
            $log.log("createGenericTree2");
            $log.log(resp);


            var groups = resp[0];

            var assetTree = {};
            for (var ridx = 1; ridx < resp.length; ridx++) {
                var assets = resp[ridx];
                for (var aidx in assets) {
                    var asset = assets[aidx];
                    var nodesInPath = vm.getNodesInPath(vm.getAssetPath(asset));
                    for (var nidx in nodesInPath) {
                        var nodePath = nodesInPath[nidx];
                        if (!(nodePath in assetTree))
                            assetTree[nodePath] = {};

                        if (assetTree[nodePath].info === undefined) {
                            assetTree[nodePath].info = null;
                        }

                        if (assetTree[nodePath].children === undefined) {
                            assetTree[nodePath].children = null;
                        }

                        if (nodePath in groups) {
                            assetTree[nodePath].info = groups[nodePath];

                            if (nidx > 0 && nidx < nodesInPath.length) {
                                if (assetTree[nodesInPath[nidx - 1]].children === null) {
                                    assetTree[nodesInPath[nidx - 1]].children = {};
                                }
                                //$log.log("parent: " + nodesInPath[nidx - 1] + ", " + "child: " + nodePath);
                                assetTree[nodesInPath[nidx - 1]].children[nodePath] = groups[nodePath];
                            }
                        }

                    }
                }
                //$log.log(assetTree);

                for (aidx in assets) {
                    asset = assets[aidx];
                    if (!(asset.pgrouppath in assetTree)) {
                        $log.log("Deadly mistake");
                        continue;
                    }

                    if (!(vm.getAssetPath(asset) in assetTree)) {
                        $log.log("Another Deadly mistake");
                        continue;
                    }

                    assetTree[vm.getAssetPath(asset)].info = asset;
                    if (assetTree[asset.pgrouppath].children === null) {
                        assetTree[asset.pgrouppath].children = {};
                    }
                    assetTree[asset.pgrouppath].children[vm.getAssetPath(asset)] = asset;
                }
            }

            //$log.log(assetTree);
            return $q.resolve(assetTree);
        };


        vm.getManagementTree = function (body) {
            return userService.getMyDirectAssetsMap(body)
                .then(vm.createGenericTree2, vm.handleFailure)
                .then(vm.createUITree2, vm.handleFailure);
        };
    }

})();



// vm.createGenericTree3 = function (resp) {
//     $log.log("createGenericTree3");
//     $log.log(resp);
//
//
//     var groups = resp[0];
//
//     var assetTree = {};
//     for (var ridx = 1; ridx < resp.length; ridx++) {
//         var assets = resp[ridx];
//         for (var aidx in assets) {
//             var asset = assets[aidx];
//             var nodesInPath = vm.getNodesInPath(vm.getAssetPath(asset));
//             $log.log(nodesInPath);
//             for (var nidx in nodesInPath) {
//                 var nodePath = nodesInPath[nidx];
//                 if (!(nodePath in assetTree)) {
//                     assetTree[nodePath] = {};
//                 }
//
//                 if(assetTree[nodePath].children === undefined) {
//                     assetTree[nodePath].children = {};
//                 }
//
//                 //$log.log(nodePath);
//                 //$log.log(assetTree[nodePath]);
//                 //$log.log(assetTree[nodePath].children);
//
//                 //assetTree[nodePath].children[asset.ui_asset_type] = {};
//
//                 if (assetTree[nodePath].info === undefined) {
//                     assetTree[nodePath].info = null;
//                 }
//
//                 // if (assetTree[nodePath].children === undefined) {
//                 //     assetTree[nodePath].children = null;
//                 // }
//                 //
//                 // if (assetTree[nodePath].children[asset.ui_asset_type] === undefined) {
//                 //     assetTree[nodePath].children[asset.ui_asset_type] = null;
//                 // }
//
//                 if (nodePath in groups) {
//                     assetTree[nodePath].info = groups[nodePath];
//
//                     if (nidx > 0 && nidx < nodesInPath.length) {
//                         if (assetTree[nodesInPath[nidx - 1]].children === undefined) {
//                             assetTree[nodesInPath[nidx - 1]].children = {};
//                         }
//
//                         if (assetTree[nodesInPath[nidx - 1]].children["group"] === undefined) {
//                             assetTree[nodesInPath[nidx - 1]].children["group"] = {};
//                         }
//
//                         //$log.log("parent: " + nodesInPath[nidx - 1] + ", " + "child: " + nodePath);
//                         assetTree[nodesInPath[nidx - 1]].children["group"][nodePath] = groups[nodePath];
//                     }
//                 } else {
//                     if (nidx > 0 && nidx < nodesInPath.length) {
//
//                         if (assetTree[nodesInPath[nidx - 1]].children[asset.ui_asset_type] === undefined) {
//                             assetTree[nodesInPath[nidx - 1]].children[asset.ui_asset_type] = {};
//                         }
//
//                         if (assetTree[nodesInPath[nidx - 1]].children[asset.ui_asset_type].children === undefined) {
//                             assetTree[nodesInPath[nidx - 1]].children[asset.ui_asset_type].children = {};
//                         }
//
//                         assetTree[nodesInPath[nidx - 1]].children[asset.ui_asset_type].children[nodePath] = asset;
//                     }
//                 }
//
//             }
//         }
//         $log.log(assetTree);
//
//         for (aidx in assets) {
//             asset = assets[aidx];
//             if (!(asset.pgrouppath in assetTree)) {
//                 $log.log("Deadly mistake");
//                 continue;
//             }
//
//             // if (assetTree[asset.pgrouppath].children === undefined) {
//             //     assetTree[asset.pgrouppath].children = {};
//             // }
//
//             if (!(asset.ui_asset_type in assetTree[asset.pgrouppath].children)) {
//                 $log.log("Another Deadly mistake");
//                 continue;
//             }
//
//             if (!(vm.getAssetPath(asset) in assetTree[asset.pgrouppath].children[asset.ui_asset_type].children)) {
//                 $log.log("You are now buried!!");
//                 continue;
//             }
//
//             assetTree[asset.pgrouppath].children[asset.ui_asset_type].info = {name: asset.ui_asset_type};
//
//             $log.log("mistake");
//             $log.log(vm.getAssetPath(asset));
//             $log.log(assetTree[asset.pgrouppath].children);
//             $log.log(assetTree[asset.pgrouppath].children[asset.ui_asset_type].children);
//
//
//             if (assetTree[asset.pgrouppath].children[asset.ui_asset_type].children === undefined) {
//                 assetTree[asset.pgrouppath].children[asset.ui_asset_type].children = {};
//             }
//
//             assetTree[asset.pgrouppath].children[asset.ui_asset_type].children[vm.getAssetPath(asset)] = asset;
//         }
//     }
//
//     $log.log(assetTree);
//     return $q.resolve(assetTree);
// };



//
// vm.createGenericTree = function (resp) {
//     var groups = resp[0];
//     var vehicles = resp[1];
//
//     var vehicleTree = {};
//     for (var vidx in vehicles) {
//         var vehicle = vehicles[vidx];
//         var nodesInPath = vm.getNodesInPath(vehicle.vehiclepath);
//         for (var nidx in nodesInPath) {
//             var nodePath = nodesInPath[nidx];
//             if (!(nodePath in vehicleTree))
//                 vehicleTree[nodePath] = {};
//
//             if (vehicleTree[nodePath].info === undefined) {
//                 vehicleTree[nodePath].info = null;
//             }
//
//             if (vehicleTree[nodePath].children === undefined) {
//                 vehicleTree[nodePath].children = null;
//             }
//
//             if (nodePath in groups) {
//                 vehicleTree[nodePath].info = groups[nodePath];
//
//                 if (nidx > 0 && nidx < nodesInPath.length) {
//                     if (vehicleTree[nodesInPath[nidx - 1]].children === null) {
//                         vehicleTree[nodesInPath[nidx - 1]].children = {};
//                     }
//                     //$log.log("parent: " + nodesInPath[nidx - 1] + ", " + "child: " + nodePath);
//                     vehicleTree[nodesInPath[nidx - 1]].children[nodePath] = groups[nodePath];
//                 }
//             }
//
//         }
//     }
//     //$log.log(vehicleTree);
//
//     for (vidx in vehicles) {
//         vehicle = vehicles[vidx];
//         if (!(vehicle.pgrouppath in vehicleTree)) {
//             $log.log("Deadly mistake");
//             continue;
//         }
//
//         if (!(vehicle.vehiclepath in vehicleTree)) {
//             $log.log("Another Deadly mistake");
//             continue;
//         }
//
//         vehicleTree[vehicle.vehiclepath].info = vehicle;
//         if (vehicleTree[vehicle.pgrouppath].children === null) {
//             vehicleTree[vehicle.pgrouppath].children = {};
//         }
//         vehicleTree[vehicle.pgrouppath].children[vehicle.vehiclepath] = vehicle;
//     }
//
//     //$log.log(vehicleTree);
//     return $q.resolve(vehicleTree);
// };
//
