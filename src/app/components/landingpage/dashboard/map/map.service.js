/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mapService', function ($log, $interval, $q, $timeout, intellicarAPI) {
                                         //intellicarAPI, vehicleService) {
            $log.log("mapService");
            var vm = this;
            vm.listeners = {};

            vm.inMap = {
                mapOptions: {},
                mapControl: {}
            };

            vm.inMarkers = [];


            vm.getMainMap = function () {
                return vm.inMap;
            };


            vm.getMainMarkers = function () {
                return vm.inMarkers;
            };


            // Bangalore
            // var lat = 12.9176383;
            // var lng = 77.6480335;

            // Mumbai
            var lat = 19.19554947109134;
            var lng = 72.83638193466376;

            vm.center = {latitude: lat, longitude: lng};
            vm.zoom = 11;
            vm.bounds = {};

            vm.getCenter = function () {
                return vm.center;
            };

            vm.getZoom = function () {
                return vm.zoom;
            };

            vm.setZoom = function (zoom) {
                vm.zoom = zoom;
            };

            vm.getBounds = function () {
                return vm.bounds;
            };

            function checkZoomLevel(min, max) {
                vm.zoom = vm.inMap.mapControl.getGMap().zoom;
                if (vm.zoom >= min && vm.zoom <= max) {
                    return true;
                }
                return false;
            }


            var zoomLevelIcon = 'big';

            vm.setMarkerIcon = function (vehicleData) {
                var iconColor = 'orange';

                if (!vehicleData.mobilistatus) {
                    iconColor = 'red';
                } else {
                    if (vehicleData.ignitionstatus) {
                        iconColor = 'green';
                    } else {
                        iconColor = 'blue';
                    }
                }

                if (checkZoomLevel(1, 6)) {
                    zoomLevelIcon = 'extra_small';
                } else if (checkZoomLevel(7, 8)) {
                    zoomLevelIcon = 'small';
                } else if (checkZoomLevel(9, 10)) {
                    zoomLevelIcon = 'medium';
                } else {
                    zoomLevelIcon = 'big';
                }

                vehicleData.iconColor = iconColor;
                vehicleData.icon = 'assets/images/markers/' + zoomLevelIcon + '/' + iconColor + '-dot.png';

                //$log.log(iconColor + ", zoom = " + vm.zoom + ", " + zoomLevelIcon);
                //return 'assets/images/markers/' + zoomLevelIcon + '/' + iconColor + '-dot.png';
            };


            vm.getMarkerIndex = function (id) {
                for (var idx in vm.inMarkers) {
                    if (vm.inMarkers[idx].id === id)
                        return idx;
                }

                return -1;
            };


            var VEHICLE_ON = "On";
            var VEHICLE_OFF = "Off";
            var VEHICLE_RUNNING = "Running";
            var VEHICLE_STOPPED = "Stopped";
            var VEHICLE_ACTIVE = "Active";
            var VEHICLE_IMMOBILIZED = "Immobilized";

            vm.processVehicleData = function (msg) {
                //$log.log(msg);
                var topic = msg[0].split('/');
                var vehicleNumber = topic[topic.length - 1];

                var newData = msg[1];
                //$log.log(newData);
                var deviceidStr = newData.deviceid;
                if(newData.deviceid.substring(0, 5) == '213GL') {
                    deviceidStr = deviceidStr.substring(5);
                }

                var vehicleData;
                var deviceid = parseInt(deviceidStr);
                var idx = vm.getMarkerIndex(deviceid);
                if (idx != -1) {
                    vehicleData = vm.inMarkers[idx];
                } else {
                    vehicleData = newData;
                    vehicleData.id = deviceid;
                    vehicleData.options = {};
                    vehicleData.options.visible = false;
                }

                vehicleData.timestamp = new Date(newData.timestamp);
                vehicleData.latitude = newData.latitude;
                vehicleData.longitude = newData.longitude;
                vehicleData.altitude = newData.altitude;
                vehicleData.title = vehicleNumber;
                vehicleData.optimized = false;
                vehicleData.speed = parseFloat(parseFloat(newData.speed).toFixed(2));
                vehicleData.direction = parseFloat(parseFloat(newData.direction).toFixed(2));
                vehicleData.carbattery = parseFloat(parseFloat(newData.carbattery).toFixed(2));
                vehicleData.devbattery = parseFloat(parseFloat(newData.devbattery).toFixed(2));
                vehicleData.ignitionstatus = newData.ignitionstatus;
                vehicleData.mobilistatus = newData.mobilistatus;

                //vehicleData.ignitionstatusStr = newData.ignitionstatus ? "On" : "Off";
                //vehicleData.ignitionstatusFilter = newData.ignitionstatus ? "Running" : "Stopped";
                //vehicleData.mobilistatusFilter = newData.mobilistatus ? "Active" : "Immobilized";

                if(vehicleData.ignitionstatus == 1) {
                    vehicleData.ignitionstatusStr = VEHICLE_ON;
                    vehicleData.ignitionstatusFilter = VEHICLE_RUNNING;

                } else {
                    vehicleData.ignitionstatusStr = VEHICLE_OFF;
                    vehicleData.ignitionstatusFilter = VEHICLE_STOPPED;
                }

                if(vehicleData.mobilistatus == 1) {
                    vehicleData.mobilistatusFilter = VEHICLE_ACTIVE;
                } else {
                    vehicleData.mobilistatusFilter = VEHICLE_IMMOBILIZED;
                    vehicleData.ignitionstatusFilter = '';
                }

                vm.setMarkerIcon(vehicleData);
                return vehicleData;
            };


            vm.updateMap = function (msgList, key) {
                if (msgList.length == 2 && msgList[0] != null && msgList[1] != null
                    && msgList[0] != undefined && msgList[1] != undefined) {
                    var vehicleData = vm.processVehicleData(msgList);
                    //$log.log(vehicleData);
                    vm.callListeners(vehicleData, key);
                } else {
                    $log.log("invalid data");
                }
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


            vm.init = function () {
                //$log.log('map init()');
                intellicarAPI.mqttService.addListener('rtgps', vm.updateMap);
            };


            vm.init();

        });
})();
