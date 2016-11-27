/**
 * Created by Rinas Musthafa on 11/27/2016.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('history2Service', history2Service);

    function history2Service($log, newMapService, $rootScope, intellicarAPI, vehicleService, $timeout) {

        var vm = this;

        vm.historyData = {};

        vm.setData = function(key, value) {
            vm.historyData[key] = value;
        };

        vm.getData = function(key) {
            if(key in vm.historyData)
                return vm.historyData[key];
            return null;
        };


        vm.historyMap = {
            map: {},
            mapOptions:{
                center: {lat:newMapService.getCenter().latitude, lng:newMapService.getCenter().longitude},
                zoom:newMapService.getZoom(),
            },
            markersByPath:newMapService.inMap.markers.markersByPath,
            vehiclesByPath : vehicleService.vehiclesByPath,
            trace:{
                path:[],
            },
        }

        vm.getHistoryData = function(){
            if (!vm.historyMap.selectedVehicle.rtgps.deviceid){
                vm.historyMap.errorMsg = "Please Select Vehicle";
                return;
            }
            if (vm.historyMap.startTime && vm.historyMap.endTime) {
                if (vm.historyMap.startTime.length && vm.historyMap.endTime.length) {

                    var starttime = moment(vm.historyMap.startTime).unix() * 1000;
                    var endtime = moment(vm.historyMap.endTime).unix() * 1000;

                    if (endtime - starttime > timeLimit)
                        endtime = starttime + timeLimit;

                    if (endtime <= starttime) {
                        vm.historyMap.errorMsg = "End time should be >= Start time";
                        return;
                    }

                    var body = {
                        vehicle: {
                            vehiclepath: vm.historyMap.selectedVehicle.rtgps.deviceid.toString(),
                            starttime: starttime,
                            endtime: endtime
                        }
                    };

                    intellicarAPI.reportService.getDeviceLocation(body)
                        .then(vm.drawTrace, vm.handleGetLocationFailure);
                } else {
                    vm.historyMap.errorMsg = "Enter valid start and end time";
                    return;
                }
            } else {
                // $log.log(vm.historyMap.startTime, vm.historyMap.endTime);
                vm.historyMap.errorMsg = "Enter valid start and end time.";
                return;
            }
        };


        vm.handleGetLocationFailure = function (resp) {
            $log.log("handleGetLocationFailure");
            $log.log(resp);
            vm.historyMap.trace.path = [];
        };


        vm.drawTrace = function(resp) {
            vm.historyMap.errorMsg = '';
            var traceData = resp.data.data;

            if (traceData.length < 1){
                vm.historyMap.errorMsg = "No Data Found";
                return;
            }

            var path = [];

            for (var idx in traceData) {
                var position = traceData[idx];
                if (position.latitude == null || position.longitude == null || position.latitude == 0 || position.longitude == 0) {
                    continue;
                }
                var latlng = new google.maps.LatLng(position.latitude, position.longitude);
                // latlng.id = vm.historyMap.deviceid;
                // latlng.deviceid = vm.historyMap.deviceid;
                latlng.gpstime = parseInt(position.gpstime);
                latlng.speed = parseInt(position.speed.toFixed(2));
                latlng.odometer = position.odometer;
                path.push(latlng);
            }
            //
            // function compare(a, b) {
            //     return a.gpstime - b.gpstime;
            // }
            // vm.historyMap.trace.path.sort(compare);

            vm.historyMap.startMarker = new google.maps.Marker({
                position: path[0],
                icon: 'assets/images/markers/big/red-dot.png',
            });


            var lastBeacon = path[path.length - 1];
            vm.historyMap.endMarker = new google.maps.Marker({
                position: lastBeacon,
                label: 'E',
                title : 'End point'
            });

            var midPoint = Math.floor(path.length / 2);
            vm.historyMap.map.setCenter(path[midPoint]);
            vm.historyMap.map.setZoom(11);

            vm.historyMap.trace = new google.maps.Polyline({path:path});
            vm.historyMap.trace.setMap(vm.historyMap.map);
            vm.historyMap.startMarker.setMap(vm.historyMap.map);
            vm.historyMap.endMarker.setMap(vm.historyMap.map);
            vm.setData('getHistory', true);
            $rootScope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true});
        };

        vm.getDefaultTime = function(){
            var dateFormat = 'YYYY-MM-DD HH:mm';

            // setting time from 6:00 AM to 7:00 PM
            var startTime = moment().hours(6).minutes(0).seconds(0).milliseconds(0).format(dateFormat);
            var endTime = moment().hours(19).minutes(0).seconds(0).milliseconds(0).format(dateFormat);

            return {
                startTime: startTime,
                endTime: endTime
            }
        };

        var MILLISEC = 1000;
        var hrs24 = 86400 * MILLISEC;
        var week = hrs24 * 7;
        var timeLimit = week;

        vm.init = function () {
            var defaultTime = vm.getDefaultTime ();
            vm.historyMap.startTime = defaultTime.startTime;
            vm.historyMap.endTime = defaultTime.endTime;

        }

        vm.init();
        
    }
    
})();

