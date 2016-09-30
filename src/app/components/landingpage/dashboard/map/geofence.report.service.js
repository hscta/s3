(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geofenceReportService', geofenceReportService);

    function geofenceReportService($log) {
        $log.log("geofenceReportService");
        var vm = this;
        vm.listener = [];


    }
})();
/**
 * Created by User on 22-09-2016.
 */
