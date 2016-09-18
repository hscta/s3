/**
 * Created by smiddela on 18/09/16.
 */


(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('reportService', reportService);

    function reportService($log, $http, $q, requestService) {
        $log.log("reportService");
        var vm = this;

        vm.getDeviceLocation = function(body) {
            return requestService.firePost('/reports/rtgps/trackhistory', body);
        }
    }

})();