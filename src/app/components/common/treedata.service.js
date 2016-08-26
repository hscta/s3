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


        vm.buildDashboardTree = function (genericTree, key) {
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
                    resultNode = vm.buildDashboardTree(genericTree, vm.getAssetPath(child));

                    if (resultNode !== null) {
                        utNode.items.push(resultNode);
                    }
                }
            }

            return utNode;
        };


        vm.createDashboardTree = function (genericTree) {
            //$log.log(genericTree);

            var uiTree = [];
            for (var key in genericTree) {
                var resultNode = vm.buildDashboardTree(genericTree, key);
                if (resultNode !== null) {
                    uiTree.push(resultNode);
                }
            }
            return $q.resolve(uiTree);
        };


        vm.buildManagementTree = function (genericTree, key) {
            //$log.log("buildManagementTree " + key);

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
                    //$log.log("parent: " + key + ", child = " + idx + ", type = " + child.ui_asset_type);
                    resultNode = vm.buildManagementTree(genericTree, vm.getAssetPath(child));
                    //$log.log(resultNode);

                    // if (resultNode !== null) {
                    //     utNode.items.push(resultNode);
                    // }


                    if (resultNode !== null) {
                        var assetTypeExists = false;
                        for(var uidx in utNode.items) {
                            var assetType = utNode.items[uidx];
                            //$log.log(assetType.title + " == " + resultNode.info.ui_asset_type);
                            if (assetType.title == resultNode.info.ui_asset_type) {
                                //$log.log("assetTypeExists ");
                                assetTypeExists = true;
                                break;
                            }
                        }

                        if(!assetTypeExists) {
                            //$log.log("assetType does not Exists");
                            assetType = {
                                id: resultNode.info.ui_asset_type,
                                title: resultNode.info.ui_asset_type,
                                info: gtNode.info,
                                ui_asset_type: 'assettype',
                                items: []
                            };
                            utNode.items.push(assetType);
                            //$log.log(assetType);
                        }
                        assetType.items.push(resultNode);
                    }
                }
            }

            return utNode;
        };


        vm.createManagementTree = function (genericTree) {
            //$log.log(genericTree);

            var uiTree = [];
            for (var key in genericTree) {
                var resultNode = vm.buildManagementTree(genericTree, key);
                if (resultNode !== null) {
                    uiTree.push(resultNode);
                }
            }
            return $q.resolve(uiTree);
        };


        vm.createGenericTree = function (resp) {
            //$log.log("createGenericTree");
            //$log.log(resp);


            var groups = resp[0];

            var assetTree = {};
            for (var ridx = 1; ridx < resp.length; ridx++) {
                var assets = resp[ridx];
                for (var aidx in assets) {
                    var asset = assets[aidx];
                    var nodesInPath = vm.getNodesInPath(vm.getAssetPath(asset));
                    for (var nidx in nodesInPath) {
                        var nodePath = nodesInPath[nidx];
                        if (!(nodePath in assetTree)) {
                            assetTree[nodePath] = {};
                            assetTree[nodePath].info = null;
                            assetTree[nodePath].children = null;
                        }

                        // if (assetTree[nodePath].info === undefined) {
                        //     assetTree[nodePath].info = null;
                        // }
                        //
                        // if (assetTree[nodePath].children === undefined) {
                        //     assetTree[nodePath].children = null;
                        // }

                        if (nodePath in groups) {
                            assetTree[nodePath].info = groups[nodePath];

                            if (nidx > 0 && nidx < nodesInPath.length) {
                                if (assetTree[nodesInPath[nidx - 1]].children === null) {
                                    assetTree[nodesInPath[nidx - 1]].children = {};
                                }

                                if (assetTree[nodesInPath[nidx - 1]].info === null) {
                                    $log.log("my control 1111");
                                    assetTree[nodesInPath[nidx - 1]].info = {
                                        name: assetTree[nodePath].info.pname,
                                        grouppath: assetTree[nodePath].info.pgrouppath
                                    };
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

                    if (assetTree[asset.pgrouppath].info === null) {
                        assetTree[asset.pgrouppath].info = {
                            name: asset.pname,
                            grouppath: asset.pgrouppath
                        };
                    }

                    assetTree[asset.pgrouppath].children[vm.getAssetPath(asset)] = asset;
                }
            }

            //$log.log(assetTree);
            return $q.resolve(assetTree);
        };


        vm.getDashboardTree = function (body) {
            var groupsPromise = userService.getMyGroupsMap(body);
            var vehiclesPromise = userService.getMyVehiclesMap(body);
            return $q.all([groupsPromise, vehiclesPromise])
                .then(vm.createGenericTree, vm.handleFailure)
                .then(vm.createDashboardTree, vm.handleFailure);
        };


        vm.getManagementTree = function (body) {
            return userService.getMyDirectAssetsMap(body)
                .then(vm.createGenericTree, vm.handleFailure)
                .then(vm.createManagementTree, vm.handleFailure);
        };
    }

})();
