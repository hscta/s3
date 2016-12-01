/**
 * Created by smiddela on 08/08/16.
 */
(function () {

    'use strict';

    angular
        .module('uiplatform')
        .service('treeDataService', treeDataService);

    function treeDataService($log, $q, userService, helperService, groupService) {
        var vm = this;
        $log.log("treeDataService");

        vm.collapsedStatus = false;


        vm.management_tree_data = function (data) {
            // console.log(data.data.data);
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


        vm.getGenericTreeIndex = function (genericTree, asset) {
            for (var idx in genericTree) {
                if (genericTree[idx].info.assetpath == asset.assetpath)
                    return idx;
            }
        };

        //
        // vm.buildDashboardTree = function (genericTree, key) {
        //     //$log.log("buildTree " + key);
        //
        //     if (genericTree === null)
        //         return null;
        //
        //     if (genericTree[key].visited == true) {
        //         //$log.log("Already visited: " + key);
        //         return null;
        //     }
        //
        //     var gtNode = genericTree[key];
        //     gtNode.visited = true;
        //
        //     //$log.log(gtNode);
        //     var utNode = {};
        //     utNode.id = key;
        //     utNode.title = gtNode.info.name;
        //     utNode.info = gtNode.info;
        //     utNode.items = [];
        //     utNode.checkStatus = false;
        //     utNode.collapsed = vm.collapsedStatus;
        //
        //     var resultNode = null;
        //     var child = null;
        //     if (gtNode.children !== null) {
        //         for (var idx in gtNode.children) {
        //             child = gtNode.children[idx];
        //             //$log.log("parent: " + key + ", child = " + idx);
        //             resultNode = vm.buildDashboardTree(genericTree, helperService.getAssetPath(child));
        //
        //             if (resultNode !== null) {
        //                 utNode.items.push(resultNode);
        //             }
        //         }
        //     }
        //
        //     return utNode;
        // };


        vm.buildDashboardTree = function (genericTree, key) {
            //$log.log("buildDashboardTree " + key);

            if (genericTree === null)
                return null;

            if (!('visited' in genericTree[key])) {
                genericTree[key].visited = true;
            } else if (genericTree[key].visited == true) {
                return null;
            }

            var gtNode = genericTree[key];
            gtNode.visited = true;

            //$log.log(gtNode);
            var utNode = {};
            utNode.id = genericTree[key].info.assetpath;
            utNode.title = gtNode.info.name;
            utNode.info = gtNode.info;
            utNode.items = [];
            utNode.checkStatus = false;
            utNode.collapsed = vm.collapsedStatus;

            var resultNode = null;
            var child = null;
            if (gtNode.children !== null) {
                for (var idx in gtNode.children) {
                    child = gtNode.children[idx];
                    //$log.log("parent: " + key + ", child = " + idx + ", type = " + child.ui_asset_type);
                    resultNode = vm.buildDashboardTree(genericTree, vm.getGenericTreeIndex(genericTree, child));
                    //$log.log(resultNode);

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

            if (!('visited' in genericTree[key])) {
                genericTree[key].visited = true;
            } else if (genericTree[key].visited == true) {
                //$log.log("Already visited: " + key);
                return null;
            }

            var gtNode = genericTree[key];
            gtNode.visited = true;

            //$log.log(gtNode);
            var utNode = {};
            utNode.id = genericTree[key].info.assetpath;
            utNode.title = gtNode.info.name;
            utNode.info = gtNode.info;
            utNode.items = [];
            utNode.checkStatus = false;
            utNode.collapsed = vm.collapsedStatus;

            var resultNode = null;
            var child = null;
            if (gtNode.children !== null) {
                for (var idx in gtNode.children) {
                    child = gtNode.children[idx];
                    //$log.log("parent: " + key + ", child = " + idx + ", type = " + child.ui_asset_type);
                    resultNode = vm.buildManagementTree(genericTree, vm.getGenericTreeIndex(genericTree, child));
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
                                items: [],
                                collapsed:vm.collapsedStatus
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

            // $log.log(uiTree);
            if(vm.globalGenericTree == null){
                vm.globalGenericTree  = uiTree;
            }

            vm.globalGenericTree[0].collapsed = true;
            vm.globalGenericTree[0].loading = false;
            return $q.resolve(uiTree);
        };

        // His group will not come in mygroups or myassetgroups API. So we need to handle him explicitly
        vm.addLoggedInUserToTree = function (asset, assetTree) {
            var assetpath = asset.assetpath;
            var pgrouppath = asset.pgrouppath;

            if (!(pgrouppath in assetTree)) {
                assetTree[pgrouppath] = {};

                if (assetTree[pgrouppath].info == null) {
                    assetTree[pgrouppath].info = {
                        name: asset.pname,
                        assetpath: asset.pgrouppath
                    };
                    helperService.addAssetInfo(assetTree[pgrouppath].info);
                }

                if (assetTree[pgrouppath].children == null) {
                    assetTree[pgrouppath].children = {};
                    assetTree[pgrouppath].children[assetpath] = asset;
                }
            }

            for (var gidx in assetTree) {
                var parentPath = helperService.getParentPath(assetTree[gidx].info);
                if (parentPath == pgrouppath) {
                    if (!(assetTree[gidx].info.assetpath in assetTree[pgrouppath].children)) {
                        if (assetTree[gidx].info.assetpath != pgrouppath) {
                            // $log.log("lolli my parent of " + assetTree[gidx].info.assetpath + " is " + pgrouppath);
                            assetTree[pgrouppath].children[assetTree[gidx].info.assetpath] = assetTree[gidx].info;
                        }
                    }
                }
            }
        };

        vm.globalGenericTree = null;


        vm.createGenericTree = function (resp) {
            //$log.log("createGenericTree");
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
                        assetTree[assetpath].collapsed = vm.collapsedStatus;

                        if (pgrouppath in groups && pgrouppath != assetpath) {
                            if (!(pgrouppath in assetTree)) {
                                assetTree[pgrouppath] = {};
                                assetTree[pgrouppath].info = groups[pgrouppath];
                                assetTree[pgrouppath].children = {};
                                assetTree[pgrouppath].children[assetpath] = asset;
                                assetTree[pgrouppath].collapsed = vm.collapsedStatus;
                            } else {
                                if (assetTree[pgrouppath].children == null) {
                                    assetTree[pgrouppath].children = {};
                                }
                                assetTree[pgrouppath].children[assetpath] = asset;
                            }
                        }
                    }

                    if('userid' in asset) {
                        vm.addLoggedInUserToTree(asset, assetTree);
                    }
                }
            }
            var assetArray = helperService.sortOnAssetLevel(assetTree);
            return $q.resolve(assetArray);
        };


        vm.getDashboardTree = function (body) {
            var groupsPromise = userService.getMyGroupsMap(body);
            var vehiclesPromise = userService.getMyVehiclesMap(body);
            return $q.all([groupsPromise, vehiclesPromise])
            //return $q.all([groupsPromise])
                .then(vm.createGenericTree, vm.handleFailure)
                .then(vm.createDashboardTree, vm.handleFailure);
        };


        vm.mergeChildTree = function (childTree) {
            var insert = true;
            if(!(childTree[Object.keys(childTree)[0]]))
                insert = false;
            // var pgrouppath = childTree[Object.keys(childTree)[0]].info.pgrouppath;
            var pgrouppath = groupService.lastGroupPath;
            searchGroup(vm.globalGenericTree, pgrouppath, childTree, insert);
            vm.globalGenericTree[0].collapsed = true;
            vm.globalGenericTree[0].loading = false;
            return $q.resolve(vm.globalGenericTree);
        };

        function searchGroup(tree, path, children, insert) {
            var groupFound = -1;
            for(var idx=0; idx < tree.length; idx++){
                if(tree[idx].info.assetpath == path){
                    tree[idx].items = [];
                    tree[idx].loading = false;
                    if(insert){
                        for(var jdx=0; jdx < children.length; jdx++){
                            if(tree[idx].items.length > 0){
                                groupFound = -1;
                                for(var kdx=0; kdx < tree[idx].items.length; kdx++){
                                    if(children[jdx].info.ui_asset_type == tree[idx].items[kdx].id){
                                        groupFound = kdx;
                                    }
                                }
                                if(groupFound >= 0){
                                    tree[idx].items[groupFound].items.push(children[jdx]);
                                }else{
                                    createAssetType(tree[idx], children[jdx], tree[idx].items.length);
                                }

                            }else{
                                createAssetType(tree[idx], children[jdx], 0);
                            }
                        }
                    }
                }else if(path.indexOf(tree[idx].info.assetpath) !== -1){
                    for(var jdx=0; jdx < tree[idx].items.length; jdx++){
                        if(tree[idx].items[jdx].id == 'group'){
                            searchGroup(tree[idx].items[jdx].items, path, children, insert);
                        }
                    }
                }
            }
        };

        function createAssetType(tree, children, idx) {
            tree.items[idx] = {};
            tree.items[idx].id = children.info.ui_asset_type;
            tree.items[idx].title = children.info.ui_asset_type;
            tree.items[idx].ui_asset_type = 'assettype';
            tree.items[idx].info = tree.info;
            tree.items[idx].items = [];
            tree.items[idx].items.push(children);
        }


        vm.getManagementTreeWithUser = function (body) {
            return groupService.getMyDirectAssetsMapWithUser(body)
            //return userService.getMyDirectAssetsMap(body)
                .then(vm.createGenericTree, vm.handleFailure)
                .then(vm.createManagementTree, vm.handleFailure);
        };

        vm.getManagementTreeNoUser = function (body) {
            return groupService.getMyDirectAssetsMap(body)
                .then(vm.createGenericTree, vm.handleFailure)
                .then(vm.createManagementTree, vm.handleFailure)
                .then(vm.mergeChildTree, vm.handleFailure);
        };


        vm.getManagementTree = function (body) {
            return groupService.getMyDirectAssetsMap(body)
                .then(vm.createGenericTree, vm.handleFailure)
                .then(vm.createManagementTree, vm.handleFailure);
        };
    }

})();
