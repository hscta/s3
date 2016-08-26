(function () {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService($log) {
        var vm = this;

        var VEHICLE = 'vehicle';
        var GROUP = 'group';
        var USER = 'user';
        var ROLE = 'role';
        var DEVICE = 'device';

        vm.tabs = [VEHICLE, GROUP, USER, ROLE, DEVICE];

        // vm.getTabIndex = function (selectedTabName) {
        //     var tabIndex = vm.tabs.indexOf(selectedTabName);
        //     if (tabIndex == -1)
        //         return 0;
        //
        //     vm.selectedTab = tabIndex;
        //     return tabIndex;
        // }


        vm.isValidAssetType = function (assetType) {
            if (vm.tabs.indexOf(assetType) == -1)
                return false;
            return true;
        }
    }

})();

