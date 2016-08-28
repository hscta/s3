/**
 * Created by smiddela on 28/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('deviceMgmtService', deviceMgmtService);

    function deviceMgmtService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        $log.log("deviceMgmtService");


        vm.handleResponse = function (resp) {
            "device response";
            $log.log(resp);
        }

        vm.handleFailure = function (resp) {
            "device failure response";
            $log.log(resp);
        }


        vm.getData = function(stateParams) {
            //$log.log("device getData");
            stateParams.state = $state.current.name;
            return intellicarAPI.groupService.getMyDevicesMap(settingsService.getCurrentGroup());
        };
    }
})();