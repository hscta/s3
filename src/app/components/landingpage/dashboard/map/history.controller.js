/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('HistoryController', HistoryController)


    function HistoryController($scope, $log, $mdDialog, dialogService,
                               $interval, intellicarAPI, history2Service,
                               geofenceViewService, $state) {
        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(0);

        vm.historyMap = history2Service.historyMapObj;

        var mapObj;

        $scope.getHistory = function () {
            //$log.log(vm.historyMap.selectedVehicle);
            history2Service.setData('getHistory', false);

            history2Service.getHistoryData();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.resizeMap = function () {
            google.maps.event.trigger(vm.historyMap.historyMap.map , 'resize');
            // google.maps.event.trigger(vm.historyMap.historyMap.mapControl.getGMap(), 'resize');
            return true;
        };


        $scope.fitBounds = function () {
            vm.historyMap.trace.fit = true;
        };

        vm.getMyFencesListener = function () {
            //$log.log("getMyFencesListener");
            vm.fences = geofenceViewService.getToDrawFences();
            vm.circles = vm.fences.circles;
            vm.polygons = vm.fences.polygons;
            //$log.log(vm.fences);
        };

        vm.loadMap = function () {
            vm.historyMap.historyMap.zoom = history2Service.historyMapObj.historyMap.zoom;
            vm.historyMap.historyMap.center = history2Service.historyMapObj.historyMap.center;
            vm.createMap();
        };

        vm.createMap = function () {
            var mapCanvas = document.getElementById("history_map");

            $log.log(vm.historyMap.historyMap.center.latitude);

            var lat = vm.historyMap.historyMap.center.latitude;
            var lng = vm.historyMap.historyMap.center.longitude;
            vm.historyMap.historyMap.mapOptions = {
                center: new google.maps.LatLng(lat,lng),
                zoom: vm.historyMap.historyMap.zoom
            }
            vm.historyMap.historyMap.map = new google.maps.Map(mapCanvas,
                vm.historyMap.historyMap.mapOptions);

            vm.historyMap.historyMap.map.addListener('click', function() {
                // markerInfowindow.close();
                // fenceInfowindow.close();
            });
        };

        vm.init = function () {
            // $log.log(vm.historyMap.dashboardMapObj.clickedMarker);

            if (vm.historyMap.dashboardMapObj.inMarkers.length) {
                vm.historyMap.dashboardMapObj.clickedMarker = vm.historyMap.dashboardMapObj.inMarkers[0];
            }

            if ($state.params.mapObj) {
                mapObj = $state.params.mapObj;
                history2Service.resetHistoryData();
                history2Service.historyMapObj.dashboardMapObj.clickedMarker = mapObj.clickedMarker;
                // $scope.clickedMarker = vm.historyMap.dashboardMapObj.clickedMarker;
                // $scope.inMarkers = vm.historyMap.dashboardMapObj.inMarkers;

                //$log.log($scope.clickedMarker);
                // vm.historyMap.historyMap.center.latitude = vm.historyMap.dashboardMapObj.clickedMarker.latitude;
                // vm.historyMap.historyMap.center.longitude = vm.historyMap.dashboardMapObj.clickedMarker.longitude;
                // vm.historyMap.deviceid = vm.historyMap.dashboardMapObj.clickedMarker.deviceid;
                vm.historyMap.selectedVehicle = vm.historyMap.dashboardMapObj.clickedMarker.rtgps;
                vm.historyMap.vehicleNumber = vm.historyMap.dashboardMapObj.clickedMarker.vehicleno;
                $scope.errorMsg = "";
            }

            if (vm.historyMap.dashboardMapObj.clickedMarker.options) {
                vm.historyMap.dashboardMapObj.clickedMarker.options.animation = null;
            }

            vm.historyMap.dashboardMapObj.clickedMarker.trace = vm.historyMap.trace;
            var selectedVehicle = dialogService.getData('selectedVehicle');
            vm.multiSelect = vm.historyMap.multiSelect;
            vm.circles = vm.historyMap.circles;
            vm.polygons = vm.historyMap.polygons;


            vm.getMyFencesListener();
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);

            vm.loadMap();

        };
        $interval($scope.resizeMap, 700);

        vm.init();
    }

})();
