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

            //$log.log("getPathId: " + path.substring(path.lastIndexOf(SLASH) + 1));
            return path.substring(path.lastIndexOf(SLASH) + 1);
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
            //.log("length of : " + assetpath.substring(0, idx).length);
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

            $log.log("my asset type id: " + assetTypeId);
            return vm.assetTypeIdToAssetType[assetTypeId];
        };


        vm.getAssetPath = function (asset) {
            if (asset == null)
                return null;

            if (ASSET_PATH in asset)
                return asset.assetpath;

            return null;
        };


        vm.addAssetInfo = function (asset) {
            if (asset == null)
                return null;

            asset.assetid = vm.getAssetId(asset);
            asset.pgrouppath = vm.getParentPath(asset);
            asset.pgroupid = vm.getParentId(asset);
            asset.ui_asset_type = vm.getAssetType(asset);
        };


        vm.mergeAssetPermissions = function (resp) {
            //$log.log("vm.mergeAssetPermissions");
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
            //$log.log("makeAssetMap");
            var data = resp.data.data;
            var assets = {};
            for (var idx in data.assets) {
                var asset = data.assets[idx];
                assets[asset.assetpath] = asset;
                $log.log(asset);
            }
            return $q.resolve(assets);
        };
    }
})();
