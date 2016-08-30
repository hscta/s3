/**
 * Created by smiddela on 28/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('groupMgmtService', groupMgmtService);

    function groupMgmtService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        $log.log("groupMgmtService");


        vm.getData = function (stateParams) {
            $log.log("group getData");
            settingsService.setCurrentGroup(stateParams);
            return intellicarAPI.groupService.getMyGroupsMap(settingsService.getCurrentGroup());
        };
    }
})();
