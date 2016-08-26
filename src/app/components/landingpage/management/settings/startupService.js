/**
 * Created by smiddela on 26/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('startupService', startupService);

    function startupService($rootScope, $log, $q, $state, intellicarAPI) {
        var vm = this;
        $log.log("startupService");

        vm.getData = function(info) {
            $log.log("startup info object");


            $log.log(intellicarAPI.stateService.STATE_HOME);
            $log.log(info);
            //$log.log($state.current.name);
            return intellicarAPI.stateService.getData(info, $state.current.name);
        }
    }
})();