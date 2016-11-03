/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('HistoryController', HistoryController)
        .controller('HistoryTableController', HistoryTableController);


    function HistoryController($scope, $log, $mdDialog, dialogService,
                               $interval, $timeout, intellicarAPI, historyService,
                               geofenceViewService, $state) {
        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(0);

        vm.historyObj = historyService.historyMapObj;
        var mapObj;

        $scope.getHistory = function () {
            // vm.historyObj.getHistory = false;
            // $log.log(vm.historyObj);
            // vm.historyObj.startTime = $('#start_time').val();
            // vm.historyObj.endTime = $('#end_time').val();

            // $log.log(vm.historyObj);

            historyService.setData('getHistory', false);

            if (vm.historyObj.startTime && vm.historyObj.endTime) {
                if (vm.historyObj.startTime.length && vm.historyObj.endTime.length) {

                    var starttime = new Date(moment(vm.historyObj.startTime).unix()*1000).getTime();
                    var endtime = new Date(moment(vm.historyObj.endTime).unix()*1000).getTime();

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

            // console.log(traceData);

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
                //$log.log(vm.historyObj.dashboardMapObj.clickedMarker);
                vm.historyObj.dashboardMapObj.clickedMarker.latitude = vm.historyObj.trace.path[0].latitude;
                vm.historyObj.dashboardMapObj.clickedMarker.longitude = vm.historyObj.trace.path[0].longitude;

                if (!vm.historyObj.dashboardMapObj.clickedMarker.hasOwnProperty('options')) {
                    vm.historyObj.dashboardMapObj.clickedMarker.options = {};
                }

                vm.historyObj.dashboardMapObj.clickedMarker.options.icons = 'assets/images/markers/big/red-dot.png';
                var midPoint = Math.floor(vm.historyObj.trace.path.length / 2);
                vm.historyObj.historyMap.center.latitude = vm.historyObj.trace.path[midPoint].latitude;
                vm.historyObj.historyMap.center.longitude = vm.historyObj.trace.path[midPoint].longitude;
                vm.historyObj.historyMap.zoom = 11;

                var lastBeacon = vm.historyObj.trace.path[vm.historyObj.trace.path.length - 1];
                vm.historyObj.endMarker.latitude = lastBeacon.latitude;
                vm.historyObj.endMarker.options.label = 'E';
                vm.historyObj.endMarker.longitude = lastBeacon.longitude;
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


        vm.getMyFencesListener = function () {
            //$log.log("getMyFencesListener");
            vm.fences = geofenceViewService.getToDrawFences();
            vm.circles = vm.fences.circles;
            vm.polygons = vm.fences.polygons;
            //$log.log(vm.fences);
        };


        vm.init = function () {
            // $log.log(vm.historyObj.dashboardMapObj.clickedMarker);

            if (vm.historyObj.dashboardMapObj.inMarkers.length) {
                vm.historyObj.dashboardMapObj.clickedMarker = vm.historyObj.dashboardMapObj.inMarkers[0];
            }

            if ($state.params.mapObj) {
                mapObj = $state.params.mapObj;
                historyService.resetHistoryData();
                historyService.historyMapObj.dashboardMapObj.clickedMarker = mapObj.clickedMarker;
                $scope.clickedMarker = vm.historyObj.dashboardMapObj.clickedMarker;
                $scope.inMarkers = vm.historyObj.dashboardMapObj.inMarkers;

                $log.log($scope.clickedMarker);
                vm.historyObj.historyMap.center = vm.historyObj.dashboardMapObj.clickedMarker;
                vm.historyObj.deviceid = vm.historyObj.dashboardMapObj.clickedMarker.deviceid;
                vm.historyObj.vehicleNumber = vm.historyObj.dashboardMapObj.clickedMarker.vehicleno;
                $scope.errorMsg = "";
            }

            if (vm.historyObj.dashboardMapObj.clickedMarker.options) {
                vm.historyObj.dashboardMapObj.clickedMarker.options.animation = null;
            }

            vm.historyObj.dashboardMapObj.clickedMarker.trace = vm.historyObj.trace;
            var selectedVehicle = dialogService.getData('selectedVehicle');
            vm.multiSelect = vm.historyObj.multiSelect;
            vm.circles = vm.historyObj.circles;
            vm.polygons = vm.historyObj.polygons;


            vm.getMyFencesListener();
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);

            $scope.getHistory();
        };

        vm.init();
        $interval($scope.resizeMap, 500);
    }

    function HistoryTableController($scope, $log, $mdDialog, dialogService,
                               $interval, $timeout, intellicarAPI, historyService,
                               geofenceViewService, $state) {


        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(1);

        var historyData =[];

        vm.historyObj = historyService.historyMapObj;

        vm.multiSelect = vm.historyObj.multiSelect;

        var MILLISEC = 1000;

        var hrs24 = 86400 * MILLISEC;

        var week = hrs24 * 7;
        var timeLimit = week;

        $scope.drawTrace = function (resp) {
            var traceData = resp.data.data;
            var path = vm.historyObj.trace.path;
            vm.historyObj.trace.path = [];

            // console.log(traceData);

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
                //$log.log(vm.historyObj.dashboardMapObj.clickedMarker);
                vm.historyObj.dashboardMapObj.clickedMarker.latitude = vm.historyObj.trace.path[0].latitude;
                vm.historyObj.dashboardMapObj.clickedMarker.longitude = vm.historyObj.trace.path[0].longitude;

                if (!vm.historyObj.dashboardMapObj.clickedMarker.hasOwnProperty('options')) {
                    vm.historyObj.dashboardMapObj.clickedMarker.options = {};
                }

                vm.historyObj.dashboardMapObj.clickedMarker.options.icons = 'assets/images/markers/big/red-dot.png';
                var midPoint = Math.floor(vm.historyObj.trace.path.length / 2);
                vm.historyObj.historyMap.center.latitude = vm.historyObj.trace.path[midPoint].latitude;
                vm.historyObj.historyMap.center.longitude = vm.historyObj.trace.path[midPoint].longitude;
                vm.historyObj.historyMap.zoom = 11;

                var lastBeacon = vm.historyObj.trace.path[vm.historyObj.trace.path.length - 1];
                vm.historyObj.endMarker.latitude = lastBeacon.latitude;
                vm.historyObj.endMarker.options.label = 'E';
                vm.historyObj.endMarker.longitude = lastBeacon.longitude;
                vm.historyObj.endMarker.options.title = 'End point';


                $scope.errorMsg = '';
                $scope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true});

                $log.log(vm.historyObj.trace.path);

                vm.showTableData();

            } else {
                $scope.errorMsg = "No Data Found";
            }
        };


        $scope.getHistory = function () {
            // $log.log('ssssssssssssssssss');
            historyService.setData('getHistory', false);

            if (vm.historyObj.startTime && vm.historyObj.endTime) {
                if (vm.historyObj.startTime.length && vm.historyObj.endTime.length) {

                    var starttime = new Date(moment(vm.historyObj.startTime).unix()*1000).getTime();
                    var endtime = new Date(moment(vm.historyObj.endTime).unix()*1000).getTime();

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





        vm.showTableData = function () {

            var marker = vm.historyObj.trace.path;
            // $log.log('mmmmmmmmmmmmmmmm');
            // $log.log(marker);
            historyData=[];

            for ( var idx in marker){
                var loc =  marker[idx].latitude + ', '+ marker[idx].longitude;
                    var time = marker[idx].gpstime;
                var ignitionStatus = marker[idx].ignstatus ? 'On' : 'Off';
                historyData.push([
                   loc,
                    new Date(time),
                    marker[idx].odometer.toString(),
                    marker[idx].speed.toString(),
                    ignitionStatus

                ]);
            }
            //
            google.charts.load('current', {'packages': ['table']});
            google.charts.setOnLoadCallback(drawTable);
        };

        function drawTable() {
            // $log.log('dddddddddddddddd')
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Location');
            data.addColumn('datetime', 'Time');
            data.addColumn('string', 'Odometer');
            data.addColumn('string', 'Speed');
            data.addColumn('string', 'IgnitionStatus');
            data.addRows(
                historyData
            );

            var dateFormatter = new google.visualization.DateFormat({pattern: 'dd-MM-yyyy hh:mm a'});
            dateFormatter.format(data, 1);
            // dateFormatter.format(data, 3);

            var table = new google.visualization.Table(document.getElementById('geo-table'));

            table.draw(data, {
                showRowNumber: true,
                width: '100%',
                page: 'enable',
                pageSize: 300
            });
        }

    }

})();
