/**
 * Created by smiddela on 18/09/16.
 */


(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('reportsService', reportsService);

    function reportsService($log, $http, $q, requestService) {
        $log.log("reportsService");
        var vm = this;

        function encloseBody(body) {
            return {"reports":body}
        }

        vm.getDeviceLocation = function(body) {
            return requestService.firePost('/reports/rtgps/trackhistory', body);
        }

        vm.getGPSLastseen = function(body) {
            body = encloseBody(body);
            return requestService.firePost('/reports/rtgps/gpslatest', body);
        }


    }

})();