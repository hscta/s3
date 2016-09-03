/**
 * Created by smiddela on 23/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('helperService', helperService);

    function helperService($rootScope, $log, $q, constantFactory) {
        var vm = this;
        $log.log("helperService");

        var SLASH = '/';
        var ROOT_GROUP = '/1/1';
        var ASSET_PATH = 'assetpath';
        var ASSET_ID = 'assetid';
        var PGROUP_PATH = 'pgrouppath';
        var PGROUP_ID = 'pgroupid';
        var UI_ASSET_TYPE = 'ui_asset_type';

        vm.assetTypeToAssetTypeId = {
            group: '1',
            user: '2',
            role: '3',
            vehicle: '4',
            vehicletype: '5',
            device: '6',
            devicetype: '7'
        };


        vm.assetTypeIdToAssetType = {
            '1': constantFactory.GROUP,
            '2': constantFactory.USER,
            '3': constantFactory.ROLE,
            '4': constantFactory.VEHICLE,
            '5': constantFactory.VEHICLETYPE,
            '6': constantFactory.DEVICE,
            '7': constantFactory.DEVICETYPE
        };


        vm.getPathId = function (path) {
            if (path == null)
                return null;

            return parseInt(path.substring(path.lastIndexOf(SLASH) + 1));
        };


        vm.getAssetId = function (asset) {
            if (asset == null)
                return null;

            if(ASSET_ID in asset)
                return asset.assetid;

            if (!(ASSET_PATH in asset))
                return null;

            return vm.getPathId(asset.assetpath);
        };


        vm.getParentPath = function (asset) {
            if (asset == null)
                return null;

            if(PGROUP_PATH in asset)
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


        vm.getParentId = function (asset) {
            if (asset == null)
                return null;

            if(PGROUP_ID in asset)
                return asset.pgroupid;

            return vm.getPathId(vm.getParentPath(asset));
        };


        vm.getAssetTypeId = function (asset) {
            if (asset == null)
                return null;

            var pgrouppath = vm.getParentPath(asset);
            if (pgrouppath == null)
                return null;

            if(pgrouppath === ROOT_GROUP && asset.assetpath == ROOT_GROUP)
                return '1';

            return asset.assetpath.substring(pgrouppath.length + 1, asset.assetpath.lastIndexOf(SLASH));
        };


        vm.getAssetType = function (asset) {
            if(asset == null)
                return null;

            if(UI_ASSET_TYPE in asset)
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


        vm.getAssetPathLevel = function(path) {
            if(path == null)
                return null;

            return (path.split(SLASH).length - 1)/2;
        };


        vm.getAssetLevel = function(asset) {
            if(asset == null)
                return null;

            if(ASSET_PATH in asset) {
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
                asset.permissions = [];
                for (var pidx in data.permissions) {
                    var permission = data.permissions[pidx];
                    if (asset.assetpath === permission.assetpath) {
                        asset.permissions.push(permission);
                    }
                }
            }

            return $q.resolve(resp);
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


        vm.sortOnAssetLevel = function(hashObj) {
            var arrayObj = [];
            for(var idx in hashObj) {
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
    }
})();
