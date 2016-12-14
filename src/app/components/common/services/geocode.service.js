/**
 * Created by harshas on 7/11/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geocodeService', geocodeService);

    function geocodeService($log, requestService, $q) {
        var vm = this;
        $log.log("geocodeService");


        var handleGetAddress = function(resp) {
            // $log.log(resp.data.data);

            if (resp.data && resp.data.data && resp.data.data.length) {
                return $q.resolve(resp.data.data);
            }

            return $q.reject(resp);
        };


        var handleGetAddressFailure = function (resp) {
            $log.log(resp);
            return $q.reject(resp);
        };


        vm.getAddress = function(body){
            return requestService.fireGeoCode('/geocodeint', body)
                .then(handleGetAddress, handleGetAddressFailure);
        }
    }
})();
