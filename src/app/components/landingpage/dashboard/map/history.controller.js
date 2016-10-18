/**
 * Created by harshas on 13/10/16.
 */

(function(){
    angular
        .module('uiplatform')
        .controller('HistoryController', HistoryController);


    function HistoryController($scope, $log, $mdDialog, dialogService,
                               $interval, $timeout, intellicarAPI, historyService,
                               geofenceViewService, $state) {
        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(0);

        vm.historyObj = historyService.historyMapObj;
        var params;

        $scope.getHistory = function () {
            // vm.historyObj.getHistory = false;
            historyService.setData('getHistory', false);

            if (vm.historyObj.startTime && vm.historyObj.endTime) {
                if (vm.historyObj.startTime.length && vm.historyObj.endTime.length) {

                    var starttime = new Date(vm.historyObj.startTime).getTime();
                    var endtime = new Date(vm.historyObj.endTime).getTime();

                    if (endtime - starttime > timeLimit)
                        endtime = starttime + timeLimit;

                    if (endtime <= starttime) {
                        $scope.errorMsg = "End time should be >= Start time";
                        return;
                    }

                    var body = {
                        vehicle: {
                            vehiclepath: vm.historyObj.deviceid.toString(),
                            starttime: starttime,
                            endtime: endtime
                        }
                    };

                    intellicarAPI.reportService.getDeviceLocation(body)
                        .then($scope.drawTrace, $scope.handleGetLocationFailure);

                } else {
                    $scope.errorMsg = "Enter valid start and end time";
                    return;
                }
            } else {
                $log.log(vm.historyObj.startTime, vm.historyObj.endTime);
                $scope.errorMsg = "Enter valid start and end time.";
                return;
            }
        };
        //
        // function processGraphdata(obj) {
        //     // Loop through objects
        //     var ob_length = Object.keys(obj).length;
        //     var graphData = {};
        //
        //     graphData.ignition = scrapData(obj,'ignition');
        // };
        //
        // function scrapData(obj) {
        //     var tempArray = [];
        //     for(idx in obj){
        //
        //     }
        // }

        if ( $state.params.mapObj){
            params = $state.params.mapObj;
            historyService.resetHistoryData();
            historyService.historyMapObj.dashboardMapObj.clickedMarker = $state.params.mapObj.clickedMarker;
            // historyService.historyMapObj.dashboardMapObj.inMarkers = $state.params.mapObj.mainMarkers;

        }else{

        }

        $log.log(vm.historyObj);
        $scope.clickedMarker = vm.historyObj.dashboardMapObj.clickedMarker;
        $scope.inMarkers = vm.historyObj.dashboardMapObj.inMarkers;

        var selectedVehicle = dialogService.getData('selectedVehicle');
        vm.multiSelect = vm.historyObj.multiSelect;
        vm.circles = vm.historyObj.circles;
        vm.polygons = vm.historyObj.polygons;

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.resizeMap = function () {
            google.maps.event.trigger(vm.historyObj.historyMap.mapControl.getGMap(), 'resize');
            return true;
        };

        var MILLISEC = 1000;
        // var hrs6 = 21600 * MILLISEC;
        // var hrs3 = 10800 * MILLISEC;
        // var hrs8 = 28800 * MILLISEC;
        // var hrs12 = 43200 * MILLISEC;
        var hrs24 = 86400 * MILLISEC;
        // var hrs48 = hrs24 * 2;
        var week = hrs24 * 7;
        var timeLimit = week;

        $scope.drawTrace = function (resp) {
            //$log.log(resp);

            var traceData = resp.data.data;
            var path = vm.historyObj.trace.path;
            vm.historyObj.trace.path = [];

            console.log(traceData);

            for (var idx in traceData) {
                var position = traceData[idx];

                if (position.latitude.constructor !== Number || position.longitude.constructor !== Number ||
                        position.latitude == 0 || position.longitude == 0
                ) {
                    $log.log("Not a number");
                    $log.log(position);
                    continue;
                }
                position.id = $scope.deviceid;
                position.gpstime = parseInt(position.gpstime);
                position.odometer = position.odometer;
                position.speed = parseInt(position.speed.toFixed(2));
                vm.historyObj.trace.path.push(position);
            }

            function compare(a, b) {
                return a.gpstime - b.gpstime;
            }

            vm.historyObj.trace.path.sort(compare);


            if (vm.historyObj.trace.path.length) {
                historyService.setData('getHistory', true);
                $log.log(vm.historyObj.dashboardMapObj.clickedMarker);
                vm.historyObj.dashboardMapObj.clickedMarker.latitude = vm.historyObj.trace.path[0].latitude;
                vm.historyObj.dashboardMapObj.clickedMarker.longitude = vm.historyObj.trace.path[0].longitude;

                if( !vm.historyObj.dashboardMapObj.clickedMarker.hasOwnProperty('options')){
                    vm.historyObj.dashboardMapObj.clickedMarker.options = {};
                    vm.historyObj.dashboardMapObj.clickedMarker.options.icons = 'assets/images/markers/big/red-dot.png';
                }else {
                    vm.historyObj.dashboardMapObj.clickedMarker.options.icons = 'assets/images/markers/big/red-dot.png';
                }

                var midPoint = Math.floor(vm.historyObj.trace.path.length / 2);
                vm.historyObj.historyMap.center.latitude = vm.historyObj.trace.path[midPoint].latitude;
                vm.historyObj.historyMap.center.longitude = vm.historyObj.trace.path[midPoint].longitude;
                vm.historyObj.historyMap.zoom = 11;

                var lastBeacon = vm.historyObj.trace.path[vm.historyObj.trace.path.length - 1];
                vm.historyObj.endMarker.latitude = lastBeacon.latitude;
                vm.historyObj.endMarker.options.label = 'E';
                vm.historyObj.endMarker.longitude = lastBeacon.longitude;
                //$scope.endMarker.options.icon = 'assets/images/markers/big/red.png';
                vm.historyObj.endMarker.options.title = 'End point';


                $scope.errorMsg = '';
                $scope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true});
            } else {
                $scope.errorMsg = "No Data Found";
            }
        };


        $scope.fitBounds = function () {
            vm.historyObj.trace.fit = true;
        };


        $scope.handleGetLocationFailure = function (resp) {
            $log.log("handleGetLocationFailure");
            $log.log(resp);
            vm.historyObj.trace.path = [];
        };


        // $scope.getClickedMarker = function () {
        //     return $scope.clickedMarker;
        // };


        vm.getMyFencesListener = function () {
            //$log.log("getMyFencesListener");
            vm.fences = geofenceViewService.getToDrawFences();
            vm.circles = vm.fences.circles;
            vm.polygons = vm.fences.polygons;
            //$log.log(vm.fences);
        };


        vm.init = function () {
            // $log.log(vm.historyObj.dashboardMapObj.clickedMarker);
            if (params == null ) {
                // $log.log(selectedVehicle);
                // vm.historyObj.dashboardMapObj.clickedMarker = {};
                // if (angular.isDefined(selectedVehicle)) {
                //     vm.historyObj.deviceid = selectedVehicle.deviceid;
                //     vm.historyObj.vehicleNumber = selectedVehicle.vehicleNumber;
                //     vm.historyObj.multiSelect = false;
                // } else {
                //     vm.historyObj.multiSelect = true;
                //     vm.historyObj.deviceid = 'Select Vehicle';
                //     vm.historyObj.vehicleNumber = 'Select Vehicle';
                // }
            } else {
                $log.log($scope.clickedMarker);
                vm.historyObj.dashboardMapObj.clickedMarker.options.animation = null;
                vm.historyObj.historyMap.center = vm.historyObj.dashboardMapObj.clickedMarker;
                vm.historyObj.deviceid = vm.historyObj.dashboardMapObj.clickedMarker.deviceid;
                vm.historyObj.vehicleNumber = vm.historyObj.dashboardMapObj.clickedMarker.vehicleno;
                $scope.errorMsg = "";
            }

            if (vm.historyObj.dashboardMapObj.inMarkers.length)
                vm.historyObj.dashboardMapObj.clickedMarker = vm.historyObj.dashboardMapObj.inMarkers[0];
            vm.historyObj.dashboardMapObj.clickedMarker.trace = vm.historyObj.trace;
            vm.getMyFencesListener();
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);

            // $scope.getHistory();
        };


        vm.init();
        // historyService.setData('clickedMarker', $scope.clickedMarker);
         $interval($scope.resizeMap, 500);
        // $timeout(vm.init, 1000);
    }

})();
