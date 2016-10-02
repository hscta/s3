(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geofenceReportService', geofenceReportService);

    function geofenceReportService($log, $q, intellicarAPI) {
        $log.log("geofenceReportService");
        var vm = this;
        vm.listeners = {};
        vm.reports = {};

        vm.getMyGeofenceReports = function () {
            return vm.reports;
        };


        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
            return $q.reject(resp);
        };


        vm.handleGeofenceReportInfoMap = function (reports) {
            //$log.log('handleGeofenceReportInfoMap');
            //$log.log(reports);
            for(var idx in reports) {
                var reportInfo = reports[idx];
                //$log.log(reportInfo);
                vm.reports[reportInfo.assetpath] = reportInfo;
            }

            //$log.log(vm.reports);
            return $q.resolve(vm.reports);
        };


        vm.handleMyGeofenceReportsMap = function (resp) {
            $log.log(resp);
            vm.reportList = resp;
            var promiseList = [];

            for (var idx in vm.reportList) {
                //$log.log(vm.reportList[idx]);
                var body = {geofencereportpath: vm.reportList[idx].assetpath};
                promiseList.push(intellicarAPI.fenceReportService.getGeofenceReportInfoMap(body));
            }

            return $q.all(promiseList)
                .then(vm.handleGeofenceReportInfoMap, vm.handleFailure);
        };


        vm.getMyGeofenceReportsMap = function () {
            return intellicarAPI.userService.getMyGeofenceReportsMap({})
                .then(vm.handleMyGeofenceReportsMap, vm.handleFailure);
        }
    }
})();
