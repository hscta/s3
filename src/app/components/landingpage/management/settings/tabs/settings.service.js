(function () {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService($log, $state, intellicarAPI) {
        var vm = this;
        vm.setTabListener = null;
        vm.currentGroup = null;

        vm.tabs = [
            intellicarAPI.constantFactory.VEHICLE,
            intellicarAPI.constantFactory.GROUP,
            intellicarAPI.constantFactory.USER,
            intellicarAPI.constantFactory.ROLE,
            intellicarAPI.constantFactory.DEVICE
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

        // vm.isValidAssetType = function (assetType) {
        //     if (vm.tabs.indexOf(assetType) == -1)
        //         return false;
        //     return true;
        // };


        vm.setCurrentGroup = function(stateParams) {
            var grouppath = null;

            if(stateParams != null && stateParams.info != null) {
                if (stateParams.info.ui_asset_type == intellicarAPI.constantFactory.GROUP) {
                    grouppath = stateParams.info.assetpath;
                } else {
                    grouppath = stateParams.info.pgrouppath;
                }
            }

            // $log.log("my to set grouppath: " + grouppath);
            vm.currentGroup = {group: {grouppath: grouppath}};
        };


        vm.getCurrentGroup = function() {
            return vm.currentGroup;
        };


        // vm.setTabStateData = function(tab, asset) {
        //     $log.log(tab);
        //     $log.log(asset);
        // };


        vm.handleSelection = function(asset) {
            // $log.log("my to handleSelection");
            var tab = "group";
            //$rootScope.$broadcast('test', {'info':asset});
            $log.log("ho ho ho asset");
            $log.log(asset);
            // is it group, vehicle, device, user, role
            if(vm.tabs.indexOf(asset.id) != -1) {
                $log.log("jai bolo");
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
                // $log.log('my to not changing state');
            }
        }
    }

})();

