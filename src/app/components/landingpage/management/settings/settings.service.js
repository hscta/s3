(function() {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService () {
        var vm = this;
        //
        var GROUP = 'group';
        var USER = 'user';
        var ROLE = 'role';
        var VEHICLE = 'vehicle';
        var DEVICE = 'device';
        var REPORT = 'report';

        vm.displayName = function(asseType) {
            // if(assetType == 'group' || assetType == 'groups')
            //     return 'Groups';
            // else if(asseType)
        }

        vm.enableTabs =  {
            group: [GROUP, USER, ROLE, VEHICLE, DEVICE],
            user: [USER],
            role: [ROLE],
            vehicle: [VEHICLE],
            device: [DEVICE],
            report:[REPORT]
        };

        vm.displayTabs = function (typeName) {
            return vm.enableTabs[typeName];
        }
    }

})();

