/**
 * Created by smiddela on 26/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('startupService', startupService);

    function startupService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        $log.log("startupService");
    }
})();