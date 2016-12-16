/**
 * Created by Rinas Musthafa on 11/27/2016.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('historyService', historyService);

    function historyService($log, mapService, $rootScope, intellicarAPI, vehicleService, $timeout, myAlarmService, $q) {

        var vm = this;

        vm.historyData = {};
        vm.listeners = {};


        vm.setData = function (key, value) {
            vm.historyData[key] = value;
        };

        vm.getData = function (key) {
            if (key in vm.historyData)
                return vm.historyData[key];
            return null;
        };


        vm.historyMap = {
            map: {},
            mapOptions: {
                center: new google.maps.LatLng(mapService.getCenter().latitude, mapService.getCenter().longitude),
                zoom: mapService.getZoom()
            },
            traceObj: [],
            markersByPath: mapService.inMap.markers.markersByPath,
            vehiclesByPath: vehicleService.vehiclesByPath,
            trace: {
                path: []
            }
        };


        vm.geoFenceReports = {
            startTime: '',
            endTime: '',
            reportId: '',
            selectedVehiclesCount: 0,
            selectedFencesCount: 0,

            filteredItems: [],
            filteredFenceItems: [],

            myHistoryData: [],
            jsonReportData: [],
            reports: [],
            fenceFilter: '',
            currRep: []
        };


        vm.setInMapLocation = function (loc) {
            vm.historyMap.mapOptions.center = angular.copy(loc);
            var latlng = new google.maps.LatLng(vm.historyMap.mapOptions.center.latitude, vm.historyMap.mapOptions.center.longitude);
            vm.historyMap.map.setCenter(latlng);
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
            if (key in vm.listeners) {
                for (var idx in vm.listeners[key]) {
                    vm.listeners[key][idx](msg, key);
                }
            }
        };

        vm.clearMap = function () {

            if (vm.historyMap.startMarker) {

                vm.historyMap.startMarker.setMap(null);
            }

            if (vm.historyMap.endMarker) {

                vm.historyMap.endMarker.setMap(null);
            }

            if ('setMap' in vm.historyMap.trace) {
                vm.historyMap.trace.setMap(null);
            }

            vm.traceControls.stopMotion();
            vm.traceControls.current = 0;
            vm.traceControls.moveTimeline();

        };

        vm.getHistoryData = function () {
            vm.clearMap();
            if (!vm.historyMap.selectedVehicle) {
                vm.historyMap.errorMsg = "Please Select Vehicle";
                $rootScope.$broadcast('gotHistoryEventFailed');
                return;
            }

            if (vm.historyMap.startTime && vm.historyMap.endTime) {
                if (vm.historyMap.startTime.length && vm.historyMap.endTime.length) {

                    var starttime = moment(vm.historyMap.startTime).unix() * 1000;
                    var endtime = moment(vm.historyMap.endTime).unix() * 1000;

                    if (endtime - starttime > timeLimit) {
                        vm.historyMap.errorMsg = "Maximum time limit is one week.";
                        $rootScope.$broadcast('gotHistoryEventFailed');
                        return;
                        // endtime = starttime + timeLimit;
                    }

                    if (endtime <= starttime) {
                        vm.historyMap.errorMsg = "End time should be >= Start time";
                        $rootScope.$broadcast('gotHistoryEventFailed');
                        return;
                    }

                    var body = {
                        vehicle: {
                            vehiclepath: vm.historyMap.selectedVehicle.rtgps.deviceid.toString(),
                            starttime: starttime,
                            endtime: endtime
                        }
                    };
                    var body2 = {
                        vehiclepath: [vm.historyMap.selectedVehicle.rtgps.deviceid.toString()],
                        starttime: starttime,
                        endtime: endtime
                    };
                    var gpsDataPromise = intellicarAPI.reportsService.getDeviceLocation(body);
                    var alarmDataPromise = intellicarAPI.myAlarmService.getAlarmInfo(body2);

                    $q.all([gpsDataPromise, alarmDataPromise])
                        .then(vm.drawTrace, vm.handleGetLocationFailure);

                } else {
                    vm.historyMap.errorMsg = "Enter valid start and end time";
                    $rootScope.$broadcast('gotHistoryEventFailed');
                    return;
                }
            } else {
                // $log.log(vm.historyMap.startTime, vm.historyMap.endTime);
                vm.historyMap.errorMsg = "Enter valid start and end time.";
                $rootScope.$broadcast('gotHistoryEventFailed');
                return;
            }
        };


        vm.handleGetLocationFailure = function (resp) {
            $log.log("handleGetLocationFailure");
            $log.log(resp);
            vm.historyMap.trace.path = [];
        };


        vm.drawTrace = function (respArray) {
            vm.setData('getHistory', true);
            vm.historyMap.errorMsg = '';

            var traceData = [];
            var alarmData = [];
            var path = [];

            if(respArray == null) {
                traceData = vm.historyMap.traceData;
                alarmData = vm.historyMap.alarmData;
            } else {
                if(respArray.length == 2) {
                    traceData = vm.historyMap.traceData = respArray[0];
                    alarmData = vm.historyMap.alarmData = respArray[1];
                } else {
                    return;
                }
            }

            if (traceData.length == 0) {
                vm.historyMap.errorMsg = "No Data";
                $rootScope.$broadcast('gotHistoryEventFailed');
                return;
            }

            for (var idx in traceData) {
                var position = traceData[idx];
                if (position.latitude == null || position.longitude == null || position.latitude == 0 || position.longitude == 0) {
                    continue;
                }
                var latlng = new google.maps.LatLng(position.latitude, position.longitude);
                latlng.odometer = position.odometer;
                latlng.heading = position.heading;
                latlng.numsat = position.numsat;
                latlng.ignstatus = position.ignstatus;
                latlng.gpstime = parseInt(position.gpstime);
                latlng.speed = parseInt(position.speed.toFixed(2));
                latlng.carbattery = position.carbattery ? parseInt(position.carbattery.toFixed(2)) : 0;
                latlng.devbattery = position.devbattery ? parseInt(position.devbattery.toFixed(2)) : 0;
                path.push(latlng);
            }

            function compare(a, b) {
                return a.gpstime - b.gpstime;
            }

            if (path.length > 0) {
                path.sort(compare);

                vm.historyMap.startMarker = new google.maps.Marker({
                    position: path[0]
                });

                var lastBeacon = path[path.length - 1];
                vm.historyMap.endMarker = new google.maps.Marker({
                    position: lastBeacon,
                    label: 'E',
                    title: 'End point'
                });

                var midPoint = Math.floor(path.length / 2);

                vm.historyMap.trace = new google.maps.Polyline({
                    path: path,
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                        },
                        offset: '100px',
                        repeat: '100px'
                    }],
                    strokeColor: "blue",
                    strokeWeight: 2,
                    strokeOpacity: 1
                });

                vm.historyMap.traceObj = path;

                if (vm.historyMap.map != null && vm.historyMap.map.setCenter) {
                    var latlng = new google.maps.LatLng(path[0].lat(), path[0].lng());
                    vm.historyMap.map.setCenter(latlng);
                    vm.historyMap.map.setZoom(11);
                    vm.historyMap.trace.setMap(vm.historyMap.map);
                    vm.historyMap.startMarker.setMap(vm.historyMap.map);
                    vm.historyMap.endMarker.setMap(vm.historyMap.map);
                }
                $rootScope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true, path: path, alarm : alarmData});
            }else{
                vm.historyMap.errorMsg = "No GPS Signal";
                $rootScope.$broadcast('gotHistoryEventFailed');
            }
        };

        vm.getDefaultTime = function () {
            var dateFormat = 'YYYY-MM-DD HH:mm';

            // setting time from 6:00 AM to 7:00 PM

            var startTimeHour = 6;
            var endTimeHour = 19;
            if (moment().unix() - moment().hours(startTimeHour).unix() < 0) {
                startTimeHour -= 24;
                endTimeHour -= 24;
            }

            var startTime = moment().hours(startTimeHour).minutes(0).seconds(0).milliseconds(0).format(dateFormat);
            var endTime = moment().hours(endTimeHour).minutes(0).seconds(0).milliseconds(0).format(dateFormat);

            return {
                startTime: startTime,
                endTime: endTime
            }
        };

        var MILLISEC = 1000;
        var hrs24 = 86400 * MILLISEC;
        var week = hrs24 * 7;
        var timeLimit = week * 2;


        vm.traceControls = {
            interval: 30000, // 30 seconds
            timeline: [],
            expandedGraphs: 'half',
            playing: false,
            SPEEDS: [2000, 1000, 500, 250, 125, 62, 31, 15, 8],
            speed: 4, // normal
            current: 0,
            excludedAlarm : ['End_of_Over_speed', 'IGNITION_OFF', 'IGNITION_ON'],
            togglePlay: function () {
                vm.traceControls.isPointer();
                if (vm.traceControls.playing) {
                    vm.traceControls.stopMotion();
                } else {
                    vm.traceControls.setPointerTransition(true);
                    vm.traceControls.startMotion()
                }
            },
            stepForward: function () {
                if (vm.traceControls.current < vm.traceControls.timeline.length - 1) {
                    vm.traceControls.current++;
                    vm.traceControls.setPointerTransition(false);
                    vm.traceControls.moveTimeline();
                }
            },
            stepBackward: function () {
                if (vm.traceControls.current > 0) {
                    vm.traceControls.current--;
                    vm.traceControls.setPointerTransition(false);
                    vm.traceControls.moveTimeline();
                }
            },
            incrementSpeed: function () {
                if (vm.traceControls.speed < vm.traceControls.SPEEDS.length - 1) {
                    vm.traceControls.speed++;
                    if (vm.traceControls.playing) {
                        vm.traceControls.startMotion();
                    }
                    vm.traceControls.setPointerTransition(true);
                }
            },
            decrementSpeed: function () {
                if (vm.traceControls.speed > 0) {
                    vm.traceControls.speed--;
                    if (vm.traceControls.playing) {
                        vm.traceControls.startMotion();
                    }
                    vm.traceControls.setPointerTransition(true);
                }
            },
            engine: {}
        };


        vm.init = function () {
            var defaultTime = vm.getDefaultTime();
            vm.historyMap.startTime = defaultTime.startTime;
            vm.historyMap.endTime = defaultTime.endTime;

            vm.geoFenceReports.startTime = defaultTime.startTime;
            vm.geoFenceReports.endTime = defaultTime.endTime;
        };

        vm.init();

    }

})();

