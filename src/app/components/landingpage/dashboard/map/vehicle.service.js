/**
 * Created by smiddela on 10/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('vehicleService', function ($log, intellicarAPI, $interval, $q, $timeout) {
            $log.log("vehicleService");
            var vm = this;
            vm.listeners = {};
            vm.vehiclePathMap = {};
            vm.vehicleNumberMap = {};


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


            var VEHICLE_ON = "On";
            var VEHICLE_OFF = "Off";
            var VEHICLE_RUNNING = "Running";
            var VEHICLE_STOPPED = "Stopped";
            var VEHICLE_ACTIVE = "Active";
            var VEHICLE_IMMOBILIZED = "Immobilized";

            vm.processVehicleData = function (vehicleNumber, msg) {
                if(!(vehicleNumber in vm.vehicleNumberMap)) {
                    vm.vehicleNumberMap[vehicleNumber] = msg;
                    return;
                }

                var vehicleData = vm.vehicleNumberMap[vehicleNumber];
                var newData = msg[1];
                //$log.log(newData);

                vehicleData.timestamp = new Date(newData.timestamp);
                vehicleData.latitude = newData.latitude;
                vehicleData.longitude = newData.longitude;
                vehicleData.altitude = newData.altitude;
                vehicleData.title = vehicleNumber;
                vehicleData.speed = parseFloat(parseFloat(newData.speed).toFixed(2));
                vehicleData.direction = parseFloat(parseFloat(newData.direction).toFixed(2));
                vehicleData.carbattery = parseFloat(parseFloat(newData.carbattery).toFixed(2));
                vehicleData.devbattery = parseFloat(parseFloat(newData.devbattery).toFixed(2));
                vehicleData.ignitionstatus = newData.ignitionstatus;
                vehicleData.mobilistatus = newData.mobilistatus;

                //vehicleData.ignitionstatusStr = newData.ignitionstatus ? "On" : "Off";
                //vehicleData.ignitionstatusFilter = newData.ignitionstatus ? "Running" : "Stopped";
                //vehicleData.mobilistatusFilter = newData.mobilistatus ? "Active" : "Immobilized";

                if(newData.ignitionstatus == 1) {
                    vehicleData.ignitionstatusStr = VEHICLE_ON;
                    vehicleData.ignitionstatusFilter = VEHICLE_RUNNING;

                } else {
                    vehicleData.ignitionstatusStr = VEHICLE_OFF;
                    vehicleData.ignitionstatusFilter = VEHICLE_STOPPED;
                }

                if(newData.mobilistatus == 1) {
                    vehicleData.mobilistatusFilter = VEHICLE_ACTIVE;
                } else {
                    vehicleData.mobilistatusFilter = VEHICLE_IMMOBILIZED;
                    vehicleData.ignitionstatusFilter = '';
                }

                //vm.setMarkerIcon(vehicleData);
                return vehicleData;
            };



            vm.updateVehicle = function (msg, key) {
                if (msg.length == 2 && msg[0] != null && msg[1] != null
                    && msg[0] != undefined && msg[1] != undefined) {
                    var topic = msg[0].split('/');
                    var vehicleNumber = topic[topic.length - 1];
                    var vehicleData = vm.processVehicleData(vehicleNumber, msg);
                    //$log.log(vehicleData);
                    vm.callListeners(vehicleData, key);
                } else {
                    $log.log("invalid data");
                }
            };


            vm.init = function () {
                //$log.log('map init()');
                intellicarAPI.mqttService.addListener('rtgps', vm.updateVehicle);
            };


            vm.init();


        });
})();
