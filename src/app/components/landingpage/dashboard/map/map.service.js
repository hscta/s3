/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mapService', function ($log, $interval, $q, $timeout, userprefService,
                                         intellicarAPI, vehicleService) {
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


            vm.checkZoomLevel = function (min, max) {
                vm.zoom = vm.inMap.mapControl.getGMap().zoom;
                return (vm.zoom >= min && vm.zoom <= max);
            };


            var EXTRA_SMALL = 'extra_small';
            var SMALL = 'small';
            var MEDIUM = 'medium';
            var BIG = 'big';

            vm.getMarkerSize = function () {
                if (vm.checkZoomLevel(1, 6)) {
                    return EXTRA_SMALL;
                } else if (vm.checkZoomLevel(7, 8)) {
                    return SMALL;
                } else if (vm.checkZoomLevel(9, 10)) {
                    return MEDIUM;
                }

                return BIG;
            };


            var RED_ICON = 'red';
            var GREEN_ICON = 'green';
            var BLUE_ICON = 'blue';
            var ORANGE_ICON = 'orange';

            vm.getMarkerColor = function (vehicleData) {
                if (!vehicleData.mobilistatus) {
                    return RED_ICON;
                } else {
                    if (vehicleData.ignitionstatus) {
                        return GREEN_ICON;
                    } else {
                        return BLUE_ICON;
                    }
                }

                return ORANGE_ICON;
            };


            vm.setMarkerIcon = function (vehicleData) {
                var newIcon = 'assets/images/markers/' + vm.getMarkerSize() + '/' + vm.getMarkerColor(vehicleData) + '-dot.png';

                if (newIcon != vehicleData.icon)
                    vehicleData.icon = newIcon;
            };


            vm.getMarkerIndex = function (id) {
                for (var idx in vm.inMarkers) {
                    if (vm.inMarkers[idx].id === id)
                        return idx;
                }

                return -1;
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


            vm.updateMarker = function (vehicleObj, key) {
                var vehicleData = vehicleObj.rtgps;
                if(!('id' in vehicleData)) {
                    var deviceidStr = vehicleData.deviceid;
                    if (deviceidStr.substring(0, 5) == '213GL') {
                        deviceidStr = deviceidStr.substring(5);
                    }
                    vehicleData.id = parseInt(deviceidStr);
                    vehicleData.options = {};
                    vehicleData.options.visible = false;
                }

                vm.setMarkerIcon(vehicleData);
                vm.callListeners(vehicleData, key);
            };


            vm.init = function () {
                //$log.log('map init()');
                //intellicarAPI.mqttService.addListener('rtgps', vm.updateMap);
                vehicleService.addListener('rtgps', vm.updateMarker);
            };


            vm.init();

        });
})();
