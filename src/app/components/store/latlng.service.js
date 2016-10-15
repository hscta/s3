/**
 * Created by smiddela on 13/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('latlngService', latlngService);

    function latlngService($log) {
        $log.log("latlngService");
        var vm = this;
        vm.initCoords = {};
        vm.geocoder = new google.maps.Geocoder();

        vm.geocodeAddress = function (address) {
            vm.geocoder.geocode({'address': address}, function (results, status) {
                if (status === 'OK') {
                    vm.initCoords = results[0].geometry.location;
                    //$log.log(vm.initCoords);
                    return vm.initCoords;
                }
            });
        };
    }
})();
