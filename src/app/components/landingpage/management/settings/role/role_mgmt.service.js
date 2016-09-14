/**
 * Created by smiddela on 28/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('roleMgmtService', roleMgmtService);

    function roleMgmtService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        $log.log("roleMgmtService");


        vm.getData = function(stateParams) {
            $log.log("role getData");
            settingsService.setCurrentGroup(stateParams);
            return intellicarAPI.groupService.getMyRolesMap(settingsService.getCurrentGroup());
        };
    }
})();
