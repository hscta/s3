(function() {
    'use strict';


    angular.module('uiplatform')
        .service('settingsService', settingsService);

    function settingsService () {
        var vm = this;

        var VEHICLE = 'vehicle';
        var GROUP = 'group';
        var USER = 'user';
        var ROLE = 'role';
        var DEVICE = 'device';

        vm.tabs = [VEHICLE, GROUP, USER, ROLE, DEVICE];
    }

})();

