/**
 * Created by smiddela on 15/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('vehicleAPIService', vehicleAPIService);

    function vehicleAPIService($log, requestService) {
        $log.log("vehicleAPIService");
        var vm = this;

        vm.encloseBody = function (data) {
            return {vehicle:data};
        };

        vm.mobilize = function (data) {
            var body = vm.encloseBody(data);
            return requestService.firePost('/vehicle/mobilize', body);
        };


        vm.immobilize = function (data) {
            var body = vm.encloseBody(data);
            return requestService.firePost('/vehicle/immobilize', body);
        };
    }
})();
