/**
 * Created by smiddela on 08/08/16.
 */
(function () {

    'use strict';

    angular
        .module('uiplatform')
        .service('treeDataService', treeDataService);

    function treeDataService($log, $q, userService, helperService) {
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
            if (angular.isUndefined(path))
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
                    resultNode = vm.buildDashboardTree(genericTree, helperService.getAssetPath(child));

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
                    resultNode = vm.buildManagementTree(genericTree, helperService.getAssetPath(child));
                    //$log.log(resultNode);

                    // if (resultNode !== null) {
                    //     utNode.items.push(resultNode);
                    // }


                    if (resultNode !== null) {
                        var assetTypeExists = false;
                        for (var uidx in utNode.items) {
                            var assetType = utNode.items[uidx];
                            //$log.log(assetType.title + " == " + resultNode.info.ui_asset_type);
                            if (assetType.title == resultNode.info.ui_asset_type) {
                                //$log.log("assetTypeExists ");
                                assetTypeExists = true;
                                break;
                            }
                        }

                        if (!assetTypeExists) {
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


        vm.createGenericTree = function (resp) {
            $log.log("createGenericTree");
            $log.log(resp);

            var groups = resp[0];
            var assetTree = {};

            for (var ridx = 0; ridx < resp.length; ridx++) {
                var assets = resp[ridx];
                //add all the asset's allowed parent hierarchy to assetTree
                for (var aidx in assets) {
                    var asset = assets[aidx];
                    //$log.log(asset);
                    var assetpath = asset.assetpath;
                    var pgrouppath = asset.pgrouppath;

                    if (!(assetpath in assetTree)) {
                        assetTree[assetpath] = {};
                        assetTree[assetpath].info = asset;
                        assetTree[assetpath].children = null;
                        //$log.log("Added: " + assetpath);

                        if (pgrouppath in groups && pgrouppath != assetpath) {
                            if (!(pgrouppath in assetTree)) {
                                assetTree[pgrouppath] = {};
                                assetTree[pgrouppath].info = groups[pgrouppath];
                                assetTree[pgrouppath].children = {};
                                assetTree[pgrouppath].children[assetpath] = asset;
                                //$log.log("Added " + pgrouppath + " as parent of " + assetpath);
                                //$log.log("Added " + assetpath + " as child of " + pgrouppath);
                            } else {
                                if (assetTree[pgrouppath].children == null) {
                                    assetTree[pgrouppath].children = {};
                                }
                                assetTree[pgrouppath].children[assetpath] = asset;
                                //$log.log("Added " + assetpath + " as child of " + pgrouppath);
                            }
                        }
                    }
                }
            }
            //$log.log(assetTree);
            return $q.resolve(assetTree);
        };
    }

})();
