/**
 * Created by smiddela on 02/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('fenceReportService2', fenceReportService2);

    function fenceReportService2($log, $q, requestService, helperService) {
        var vm = this;
        $log.log("fenceReportService");


        vm.getGoefenceReportInfo = function (body) {
            var reqbody = {geofencereport: body};
            return requestService.firePost('/geofencereport/info', reqbody);
        };


        vm.getGeofenceReportInfoMap = function (body) {
            return vm.getGoefenceReportInfo(body)
                .then(helperService.mergeAssetAssignments, vm.handleFailure);
        };


        vm.handleResponse = function (resp) {
            //$log.log(resp);
            return $q.resolve(resp);
        };


        vm.handleFailure = function (resp) {
            return $q.reject(resp);
        };
    }

})();