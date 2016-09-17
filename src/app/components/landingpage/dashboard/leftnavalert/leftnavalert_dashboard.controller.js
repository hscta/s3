/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($log, leftNavAlertDashboardService, mapService) {
        var vm = this;
        vm.alertDetails = [];
        vm.inMarkers = [];
        vm.getDashboardAlerts = function (data) {
            $log.log(data);
            vm.formatAlertData(data);

            $log.log(vm.alertDetails);
        };

        var count = 0;
        vm.formatAlertData = function (data) {
            var details = {};
            for (var i = 0; i < data.length; i++) {
                details = {};
                details.name = data[i].info.name;
                details.assetpath = data[i].info.assetpath;
                details.id = count++;
                vm.alertDetails.push(details);

                if (data[i].items.length)
                    vm.formatAlertData(data[i].items)
            }
        };

        vm.getDashboardAlertsFailure = function (data) {
            $log.log("getDashboardTreeFailure");
            $log.log(data);
        };


        vm.alertResolve2 = function (alertId) {
            $log.log(alertId);
            for (var i = 0; i < vm.alertDetails.length; i++) {
                if (alertId == vm.alertDetails[i].id) {
                    $log.log('matched');
                    vm.alertDetails.splice(i, 1);
                    return;
                }
            }
        };


        vm.alertResolve = function (alertid) {
            $log.log(alertid);
            for (var i = 0; i < vm.inMarkers.length; i++) {
                if (alertid == vm.inMarkers[i].id) {
                    $log.log('matched');
                    vm.inMarkers.splice(i, 1);
                    return;
                }
            }
        };


        vm.updateMarker = function (vehicleData) {
            //$log.log('alertController updateMarker');
            var isNewVehicle = true;
            //var vehicleData = vm.processVehicleData(msg);
            //$log.log(vehicleData);

            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id == vehicleData.id) {
                    vehicleData.options = vm.inMarkers[idx].options;
                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                }
            }

            if (isNewVehicle) {
                vehicleData.options = {};
                vm.inMarkers.push(vehicleData);
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }
        };


        vm.alertClick = function (alertid) {
            leftNavAlertDashboardService.alertClick(alertid);
        };


        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
        };


        vm.initialize = function () {
            leftNavAlertDashboardService.getDashboardAlerts({})
                .then(vm.getDashboardAlerts, vm.getDashboardAlertsFailure);
        };


        //vm.initialize();
        vm.addListener();
    }
})();
