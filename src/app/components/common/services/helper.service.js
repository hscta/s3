/**
 * Created by smiddela on 23/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('helperService', helperService);

    function helperService($rootScope, $log, $q, appConstants) {
        var vm = this;
        $log.log("helperService");

        var SLASH = '/';
        var ROOT_GROUP = '/1/1';
        var ASSET_PATH = 'assetpath';
        var ASSET_ID = 'assetid';
        var PGROUP_PATH = 'pgrouppath';
        var PGROUP_ID = 'pgroupid';
        var UI_ASSET_TYPE = 'ui_asset_type';

        // should be same as defined in backend
        vm.assetTypeIdToAssetType = {
            '1': appConstants.GROUP,
            '2': appConstants.USER,
            '3': appConstants.ROLE,
            '4': appConstants.VEHICLE,
            '5': appConstants.VEHICLETYPE,
            '6': appConstants.DEVICE,
            '7': appConstants.DEVICETYPE,
            '15': appConstants.FENCE,
            '17': appConstants.FENCEREPORT
        };


        // generating reverse lookup
        vm.assetTypeToAssetTypeId = function () {
            var assetTypeToAssetTypeId = {};
            for (var idx in vm.assetTypeIdToAssetType) {
                assetTypeToAssetTypeId[vm.assetTypeIdToAssetType[idx]] = idx;
            }
            return assetTypeToAssetTypeId;
        }();


        vm.getPathId = function (path) {
            if (path == null)
                return null;

            return parseInt(path.substring(path.lastIndexOf(SLASH) + 1));
        };


        vm.getAssetId = function (asset) {
            if (asset == null)
                return null;

            if (ASSET_ID in asset)
                return asset.assetid;

            if (!(ASSET_PATH in asset))
                return null;

            return vm.getPathId(asset.assetpath);
        };


        vm.getParentPath = function (asset) {
            if (asset == null)
                return null;

            if (PGROUP_PATH in asset)
                return asset.pgrouppath;

            if (!(ASSET_PATH in asset))
                return null;

            var assetpath = asset.assetpath;

            if (assetpath == null)
                return null;

            if (assetpath === ROOT_GROUP)
                return ROOT_GROUP;

            var count = 0;
            for (var idx = assetpath.length - 1; idx > 0; idx--) {
                if (assetpath.charAt(idx) === SLASH) {
                    if (++count === 2)
                        break;
                }
            }
            return assetpath.substring(0, idx);
        };

        vm.getParentFromPath = function (assetpath) {

            if (assetpath == null)
                return null;

            if (assetpath === ROOT_GROUP)
                return ROOT_GROUP;

            var count = 0;
            for (var idx = assetpath.length - 1; idx > 0; idx--) {
                if (assetpath.charAt(idx) === SLASH) {
                    if (++count === 2)
                        break;
                }
            }
            return assetpath.substring(0, idx);
        }


        vm.getParentId = function (asset) {
            if (asset == null)
                return null;

            if (PGROUP_ID in asset)
                return asset.pgroupid;

            return vm.getPathId(vm.getParentPath(asset));
        };


        vm.getAssetTypeId = function (asset) {
            if (asset == null)
                return null;

            var pgrouppath = vm.getParentPath(asset);
            if (pgrouppath == null)
                return null;

            if (pgrouppath === ROOT_GROUP && asset.assetpath == ROOT_GROUP)
                return '1';

            return asset.assetpath.substring(pgrouppath.length + 1, asset.assetpath.lastIndexOf(SLASH));
        };


        vm.getAssetType = function (asset) {
            if (asset == null)
                return null;

            if (UI_ASSET_TYPE in asset)
                return asset.ui_asset_type;

            var assetTypeId = vm.getAssetTypeId(asset);
            if (assetTypeId == null)
                return null;

            return vm.assetTypeIdToAssetType[assetTypeId];
        };


        vm.getAssetPath = function (asset) {
            if (asset == null)
                return null;

            if (ASSET_PATH in asset)
                return asset.assetpath;

            return null;
        };


        vm.getAssetPathLevel = function (path) {
            if (path == null)
                return null;

            return (path.split(SLASH).length - 1) / 2;
        };


        vm.getAssetLevel = function (asset) {
            if (asset == null)
                return null;

            if (ASSET_PATH in asset) {
                return vm.getAssetPathLevel(asset.assetpath);
            }
        };


        vm.addAssetInfo = function (asset) {
            if (asset == null)
                return null;

            asset.assetid = vm.getAssetId(asset);
            asset.pgrouppath = vm.getParentPath(asset);
            asset.pgroupid = vm.getParentId(asset);
            asset.ui_asset_type = vm.getAssetType(asset);
            asset.assetlevel = vm.getAssetLevel(asset);
        };


        vm.mergeAssetPermissions = function (resp) {
            var data = resp.data.data;
            for (var idx in data.assets) {
                var asset = data.assets[idx];
                vm.addAssetInfo(asset);
                //asset.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (asset.assetpath === permission.assetpath) {
                        asset.permissions = JSON.parse(permission.permid);
                    }
                }
            }

            return $q.resolve(resp);
        };

        vm.mergeUserPermissions = function (resp){
            // $log.log(resp);
            var usersList = [];
            var data = resp[0].data.data;
            for ( var idx in data.assets){
                var asset = data.assets[idx];
                for ( var perm in data.permissions){
                    var permission = data.permissions[perm];
                    if ( asset.assetpath == permission.assetpath){
                        usersList.push({
                            assetpath:asset.assetpath,
                            name:asset.name,
                            pname:asset.pname,
                            assetid:permission.assetid,
                            permid:permission.permid
                        });
                    }
                }
            }
            return $q.resolve(usersList);
        };


        vm.mergeAssetAssignments = function (resp) {
            //$log.log(resp);
            var data = resp.data.data;
            var asset = data.asset[0];
            asset.info = data.info;
            asset.assg = data.assg;
            asset.assginfo = data.assginfo;
            asset.permissions = JSON.parse(data.permissions[0].permid);
            //$log.log(asset);
            return $q.resolve(asset);
        };


        vm.makeAssetMap = function (resp) {
            var data = resp.data.data;
            var assets = {};
            for (var idx in data.assets) {
                var asset = data.assets[idx];
                assets[asset.assetpath] = asset;
            }
            return $q.resolve(assets);
        };


        vm.makeAssetList = function (resp) {
            var data = resp.data.data;
            var assets = [];
            for (var idx in data.assets) {
                var asset = data.assets[idx];
                asset.id = data.assets[idx].assetid;
                assets.push(asset);
            }
            return $q.resolve(assets);
        };


        vm.makeMapOnAssetPath = function (resp) {
            // diff with makeAssetMap is that this function
            // is directly reading from the array
            var data = resp.data.data;
            var assets = {};
            for (var idx in data) {
                var asset = data[idx];
                vm.addAssetInfo(asset);
                assets[asset.assetpath] = asset;
            }
            return $q.resolve(assets);
        };


        vm.sortOnAssetLevel = function (hashObj) {
            var arrayObj = [];
            for (var idx in hashObj) {
                arrayObj.push(hashObj[idx]);
            }

            function compare(a, b) {
                return a.info.assetlevel - b.info.assetlevel;
            }

            arrayObj.sort(compare);

            return arrayObj;
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


        JSON.flatten = function (data) {
            var result = {};

            function recurse(cur, prop) {
                if (Object(cur) !== cur) {
                    result[prop] = cur;
                } else if (Array.isArray(cur)) {
                    for (var i = 0, l = cur.length; i < l; i++)
                        recurse(cur[i], prop + "[" + i + "]");
                    if (l == 0)
                        result[prop] = [];
                } else {
                    var isEmpty = true;
                    for (var p in cur) {
                        isEmpty = false;
                        recurse(cur[p], prop ? prop + "." + p : p);
                    }
                    if (isEmpty && prop)
                        result[prop] = {};
                }
            }

            recurse(data, "");
            return result;
        };


        JSON.flatten2 = function (data) {
            var result = {};

            function recurse(cur, prop) {
                if (Object(cur) !== cur) {
                    result[prop] = cur;
                } else if (Array.isArray(cur)) {
                    for (var i = 0, l = cur.length; i < l; i++) {
                        if (typeof cur[i] === 'object') {
                            recurse(cur[i], prop + "[" + i + "]");
                        }
                        else {
                            if (i == 0) {
                                result[prop] = [];
                            }
                            result[prop].push(cur[i]);
                        }
                    }
                    if (l == 0)
                        result[prop] = [];
                } else {
                    var isEmpty = true;
                    for (var p in cur) {
                        isEmpty = false;
                        recurse(cur[p], prop ? prop + "." + p : p);
                    }
                    if (isEmpty && prop)
                        result[prop] = {};
                }
            }

            recurse(data, "");
            return result;
        };


        JSON.unflatten = function (data) {
            "use strict";
            if (Object(data) !== data || Array.isArray(data))
                return data;
            var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
                resultholder = {};
            for (var p in data) {
                var cur = resultholder,
                    prop = "",
                    m;
                while (m = regex.exec(p)) {
                    cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
                    prop = m[2] || m[1];
                }
                cur[prop] = data[p];
            }
            return resultholder[""] || resultholder;
        };
    }
})();
