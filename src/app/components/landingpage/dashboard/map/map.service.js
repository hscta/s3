/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mapService', function ($log, intellicarAPI, $interval, $q, $timeout) {
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


//            var lat = 12.9176383;
//            var lng = 77.6480335;

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
                        iconColor = 'blue';
                    } else {
                        iconColor = 'green';
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

            vm.processVehicleData = function (msg) {
                var topic = msg[0].split('/');
                var vehicleNumber = topic[topic.length - 1];
                var vehicleData;

                var deviceid = parseInt(msg[1].deviceid);
                var idx = vm.getMarkerIndex(deviceid);
                if (idx != -1) {
                    vehicleData = vm.inMarkers[idx];
                } else {
                    vehicleData = msg[1];
                    vehicleData.id = deviceid;
                    vehicleData.options = {};
                    vehicleData.options.visible = false;
                }

                vehicleData.title = vehicleNumber;
                vehicleData.optimized = false;
                vehicleData.speed = parseFloat(parseFloat(vehicleData.speed).toFixed(2));
                vehicleData.direction = parseFloat(parseFloat(vehicleData.direction).toFixed(2));
                vehicleData.carbattery = parseFloat(parseFloat(vehicleData.carbattery).toFixed(2));
                vehicleData.devbattery = parseFloat(parseFloat(vehicleData.devbattery).toFixed(2));
                vehicleData.ignitionstatusStr = vehicleData.ignitionstatus ? "On" : "Off";
                vehicleData.ignitionstatusFilter = vehicleData.ignitionstatus ? "Running" : "Stopped";
                // if(!vehicleData.mobilistatus)
                //     $log.log(msg);
                vehicleData.mobilistatusFilter = vehicleData.mobilistatus ? "Active" : "Immobilized";
                vehicleData.timestamp = new Date(vehicleData.timestamp);
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
