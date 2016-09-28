/**
 * Created by smiddela on 28/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geofenceService', geofenceService);

    function geofenceService($log, requestService) {
        var vm = this;
        $log.log("geofenceService");


        vm.getFenceInfo = function(body) {
            var reqbody = {geofence: body};
            return requestService.firePost('/geofence/info', reqbody);
        };
    }

})();