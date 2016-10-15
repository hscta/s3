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


        vm.mobilize = function (body) {
            
        };


        vm.immobilize = function (body) {

        };
    }
})();
