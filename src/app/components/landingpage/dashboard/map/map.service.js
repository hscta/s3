/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mapService', function ($log, intellicarAPI, $q, $timeout) {
            $log.log("mapService");
            var vm = this;
            vm.msgListeners = [];

//            var lat = 12.9176383;
//            var lng = 77.6480335;

            var lat = 19.19554947109134;
            var lng = 72.83638193466376;

            vm.center = {latitude: lat, longitude: lng};
            vm.zoom = 10;
            vm.bounds = {};

            vm.getCenter = function () {
                return vm.center;
            };

            vm.getZoom = function () {
                return vm.zoom;
            };

            vm.getBounds = function () {
                return vm.bounds;
            };


            vm.addMsgListener = function (listener) {
                if (vm.msgListeners.indexOf(listener) == -1){
                    vm.msgListeners.push(listener);
                }
            };


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

                vehicleData.iconColor = iconColor;
                return 'http://maps.google.com/mapfiles/ms/icons/' + iconColor + '-dot.png';
            };


            vm.processVehicleData = function (msg) {
                var topic = msg[0].split('/');
                var vehicleNumber = topic[topic.length - 1];
                var vehicleData = msg[1];
                vehicleData.id = parseInt(vehicleData.deviceid);
                vehicleData.title = vehicleNumber;
                vehicleData.icon = vm.setMarkerIcon(vehicleData);
                vehicleData.speed = parseFloat(parseFloat(vehicleData.speed).toFixed(2));
                vehicleData.direction = parseFloat(parseFloat(vehicleData.direction).toFixed(2));
                vehicleData.carbattery = parseFloat(parseFloat(vehicleData.carbattery).toFixed(2));
                vehicleData.devbattery = parseFloat(parseFloat(vehicleData.devbattery).toFixed(2));
                vehicleData.ignitionstatusStr = vehicleData.ignitionstatus ? "On" : "Off";
                vehicleData.ignitionstatusFilter = vehicleData.ignitionstatus ? "Running" : "Stopped";
                vehicleData.mobilistatusFilter = vehicleData.mobilistatus ? "Active" : "Immobilized";
                vehicleData.timestamp = new Date(vehicleData.timestamp);
                return vehicleData;
            };


            vm.updateMap = function (msgList) {
                if(msgList.length == 2 && msgList[0] != null && msgList[1] != null
                && msgList[0] != undefined && msgList[1] != undefined) {
                    var vehicleData = vm.processVehicleData(msgList);
                    //$log.log(vehicleData);
                    for (var eachidx in vm.msgListeners) {
                        vm.msgListeners[eachidx](vehicleData);
                    }
                }
            };


            vm.intMap = function () {
                $log.log('map initMap');
                intellicarAPI.mqttService.addMsgListener(vm.updateMap);
            };

            vm.intMap();
        });
})();
