/**
 * Created by smiddela on 22/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userMgmtService', userMgmtService);

    function userMgmtService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        $log.log("userMgmtService");

        vm.handleResponse = function (resp) {
            $log.log("userMgmtService handleResponse");
            return $q.resolve(resp)
        };

        vm.handleFailure = function (resp) {
            $log.log("userMgmtService handleFailure");
            return $q.reject(resp);
        };


        vm.getData = function(stateParams) {
                $log.log("user getData");
            settingsService.setCurrentGroup({group: {grouppath: stateParams.info.pgrouppath}});

            //stateParams.state = $state.current.name;
            return intellicarAPI.groupService.getMyUsersMap(settingsService.getCurrentGroup());
        };
    }
})();