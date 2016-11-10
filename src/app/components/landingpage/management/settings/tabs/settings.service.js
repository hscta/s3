(function () {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService($log, $state, intellicarAPI, $timeout) {
        $log.log('settingsService');
        var vm = this;
        vm.setTabListener = null;
        vm.currentGroup = null;

        vm.tabs = [
            intellicarAPI.appConstants.VEHICLE,
            intellicarAPI.appConstants.GROUP,
            intellicarAPI.appConstants.USER,
            intellicarAPI.appConstants.ROLE,
            intellicarAPI.appConstants.DEVICE
        ];


        vm.getTabIndex = function (assetType) {
            var tabIndex = vm.tabs.indexOf(assetType);
            if (tabIndex == -1)
                return 0;

            return tabIndex;
        };


        vm.setTab = function(assetType) {
            vm.setTabListener(vm.getTabIndex(assetType));
        };

        vm.addSetTabListener = function(listener) {
            vm.setTabListener = listener;
        };


        vm.setCurrentGroupPath = function(grouppath) {

            vm.currentGroup = {grouppath: grouppath};
            console.log(vm.currentGroup);
        };

        vm.setCurrentGroup = function(stateParams) {
            var grouppath = null;

            if(stateParams != null && stateParams.info != null) {
                if (stateParams.info.ui_asset_type == intellicarAPI.appConstants.GROUP) {
                    grouppath = stateParams.info.assetpath;
                } else {
                    grouppath = stateParams.info.pgrouppath;
                }
            }

            // vm.currentGroup =  grouppath;
            vm.currentGroup = {grouppath: grouppath};
            // console.log(vm.currentGroup);
            //return grouppath;
        };


        vm.getCurrentGroup = function() {
            return vm.currentGroup;
        };


        vm.getRequestedGroupPath = function(stateParams) {
            var grouppath = null;

            if(stateParams != null && stateParams.info != null) {
                if (stateParams.info.ui_asset_type == intellicarAPI.appConstants.GROUP) {
                    grouppath = stateParams.info.assetpath;
                } else {
                    grouppath = stateParams.info.pgrouppath;
                }
            }

            return grouppath;
        };


        vm.getCurrentGroupPath = function() {
            if(vm.currentGroup && 'grouppath' in vm.currentGroup)
                return vm.currentGroup.grouppath;

            return null;
        };



        vm.handleAssetClick = function(asset) {
            var tab = "group";
            // $log.log(asset);
            // is it group, vehicle, device, user, role
            if(vm.tabs.indexOf(asset.id) != -1) {
                tab = asset.id;
            } else {
                $log.log("duniya " + asset.info.ui_asset_type);
                tab = asset.info.ui_asset_type;
            }

            //vm.setTabStateData(tab, asset);

            var tabState = intellicarAPI.stateService.STATE_HOME_MANAGEMENT_DOT + tab;

            // $log.log("my to before cond " + tabState);
            // $log.log(asset);

            if(vm.tabs.indexOf(asset.id) == -1) {
                // $log.log('my to Going to state ' + tabState);
                $state.go(tabState, asset);
            } else {
                $log.log('Not changing state');
            }
        }
    }

})();

