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
            $log.log('geofenceReportService');
            //$log.log(reports);
            for(var idx in reports) {
                var reportInfo = reports[idx];
                //$log.log(reportInfo);
                vm.reports[reportInfo.assetpath] = reportInfo;
            }

            $log.log(vm.reports);
            vm.callListeners(vm.reports, 'mygeofencereportsinfo');

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
        };


        vm.addListener = function (key, listener) {
            if (!(key in vm.listeners)) {
                vm.listeners[key] = [];
            }

            if (vm.listeners[key].indexOf(listener) === -1) {
                vm.listeners[key].push(listener);
            }
        };


        vm.callListeners = function (msg, key) {
            if(key in vm.listeners) {
                for(var idx in vm.listeners[key]) {
                    vm.listeners[key][idx](msg, key);
                }
            }
        };



        vm.init = function () {
            vm.getMyGeofenceReportsMap();
        };


        vm.init();
    }
})();
