(function() {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService ($log) {
        var vm = this;

        var VEHICLE = 'vehicle';
        var GROUP = 'group';
        var USER = 'user';
        var ROLE = 'role';
        var DEVICE = 'device';

        vm.tabs = [VEHICLE, GROUP, USER, ROLE , DEVICE];

        vm.getTabIndex = function(selectedTabName){
            $log.log(vm.tabs);
            for ( var idx in vm.tabs){
                if ( selectedTabName === vm.tabs[idx]){
                    vm.selectedTabIndex = idx;
                    return idx;
                }
            }
        }

    }

})();

