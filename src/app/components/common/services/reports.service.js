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

        vm.handleTrackHistory = function (resp) {
            if(resp.data && resp.data.data) {
                return $q.resolve(resp.data.data);
            }
            return $q.reject(resp);
        };


        vm.handleFailure = function (resp) {
            $log.log(resp);
            $q.reject(resp);
        };


        vm.getDeviceLocation = function(body) {
            return requestService.firePost('/reports/rtgps/trackhistory', body)
                .then(vm.handleTrackHistory, vm.handleFailure);
        };

        vm.getBatteryInfo = function(body) {
            return requestService.firePost('/reports/battery/trackhistory', body)
                .then(vm.handleTrackHistory, vm.handleFailure);
        };

        vm.getGPSLastseen = function(body) {
            body = encloseBody(body);
            return requestService.firePost('/reports/rtgps/gpslatest', body);
        }


    }

})();