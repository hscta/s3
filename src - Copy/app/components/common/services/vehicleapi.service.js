/**
 * Created by smiddela on 15/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('vehicleAPIService', vehicleAPIService);

    function vehicleAPIService($log, $q, requestService) {
        $log.log("vehicleAPIService");
        var vm = this;

        vm.encloseBody = function (data) {
            return {vehicle:data};
        };


        vm.handleResponse = function (resp) {
            return $q.resolve(resp.data.data);
        };


        vm.handleFailure = function (resp) {
            $log.log("handleFailure");
            $log.log(resp);
            return $q.reject(resp);
        };


        vm.mobilize = function (data) {
            var body = vm.encloseBody(data);
            return requestService.firePost('/vehicle/mobilize', body)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.immobilize = function (data) {
            var body = vm.encloseBody(data);
            return requestService.firePost('/vehicle/immobilize', body)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMobilityCommandStatus = function (data) {
            var body = vm.encloseBody(data);
            return requestService.firePost('/vehicle/immobihist', body)
                .then(vm.handleResponse, vm.handleFailure);
        };
    }
})();
