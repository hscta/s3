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

        vm.isValidAssetType = function (assetType) {
            if (vm.tabs.indexOf(assetType) == -1)
                return false;
            return true;
        };


        vm.setCurrentGroup = function(currentGroup) {
            vm.currentGroup = currentGroup;
        };

        vm.getCurrentGroup = function() {
            return vm.currentGroup;
        };


        vm.setTabStateData = function(tab, asset) {
            $log.log(tab);
            $log.log(asset);
        };


        vm.handleSelection = function(asset) {
            var tab = "group";
            //$rootScope.$broadcast('test', {'info':asset});
            if(vm.tabs.indexOf(asset.id) != -1) {
                tab = asset.id;
            } else {
                tab = asset.info.ui_asset_type;
            }

            //vm.setTabStateData(tab, asset);

            var tabState = intellicarAPI.stateService.STATE_HOME_MANAGEMENT_DOT + tab;

            //$log.log(tabState);
            //$log.log(asset);

            if(vm.tabs.indexOf(asset.id) == -1) {
                //$log.log('It is asset');
                $state.go(tabState, asset);
            } else {
                //$log.log('It is assetType');
            }
        }
    }

})();

