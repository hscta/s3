(function() {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService () {
        var vm = this;
        //
        var GROUPS = 'groups';
        var USERS = 'users';
        var ROLES = 'roles';
        var VEHICLES = 'vehicles';
        var DEVICES = 'devices';
        var REPORTS = 'reports';

        vm.displayName = function(asseType) {
            // if(assetType == 'group' || assetType == 'groups')
            //     return 'Groups';
            // else if(asseType)
        }

        vm.enableTabs =  {
            group: [GROUPS, USERS, ROLES, VEHICLES, DEVICES],
            user: [USERS],
            role: [ROLES],
            vehicle: [VEHICLES],
            device: [DEVICES],
            report:[REPORTS]
        };

        vm.displayTabs = function (type_name) {
            return vm.enableTabs[type_name];
        }
    }

})();

