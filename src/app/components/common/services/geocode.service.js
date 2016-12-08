/**
 * Created by harshas on 7/11/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geocodeService', geocodeService);

    function geocodeService($log, requestService) {
        var vm = this;
        $log.log("geocodeService");

        vm.getAddress = function(body){
            return requestService.fireGeoCode('/geocodeint', body);
        }
    }
})();
