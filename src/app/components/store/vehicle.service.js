/**
 * Created by smiddela on 10/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('vehicleService', vehicleService);

    function vehicleService($log, intellicarAPI) {
        $log.log("vehicleService");
        var vm = this;
        vm.vehiclesByPath = {};
        vm.vehiclesByNumber = {};
        vm.listeners = {};


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
        var VEHICLE_NOT_COMMUNICATING = "Not Communicating";
        var VEHICLE_DEVICE_PULLOUT = "Device Pullout";

        vm.processVehicleData = function (msg) {
            var newData = msg[1];

            if(newData.vehiclepath == null || newData.vehiclepath.length == 0)
                return null;

            if (!(newData.vehiclepath in vm.vehiclesByPath)) {
                //vm.vehiclesByPath[newData.vehiclepath] = msg;
                $log.log("Receiveing data of vehicle not owned by user!!");
                return;
            }

            var vehicleObj = vm.vehiclesByPath[newData.vehiclepath];
            if (!('rtgps' in vehicleObj)) {
                vehicleObj.rtgps = newData;
                vm.callListeners(vehicleObj.rtgps, 'rtgps2');
            }

            var rtgps = vehicleObj.rtgps;
            //$log.log(msg[0]);
            //$log.log(newData);


            rtgps.timestamp = new Date(newData.timestamp);
            rtgps.deviceid = newData.deviceid;
            rtgps.latitude = newData.latitude;
            rtgps.longitude = newData.longitude;
            rtgps.altitude = newData.altitude;
            rtgps.vehicleno = newData.vehicleno;
            rtgps.odometer = newData.odometer;
            rtgps.speed = parseFloat(parseFloat(newData.speed).toFixed(2));
            rtgps.direction = parseFloat(parseFloat(newData.direction).toFixed(2));
            rtgps.carbattery = parseFloat(parseFloat(newData.carbattery).toFixed(2));
            rtgps.devbattery = parseFloat(parseFloat(newData.devbattery).toFixed(2));
            rtgps.ignitionstatus = newData.ignitionstatus;
            rtgps.mobilistatus = newData.mobilistatus;

            var currentTime = new Date().getTime();

            if (currentTime - rtgps.timestamp.getTime() > 8 * 3600 * 1000) {
                rtgps.noComm = 'no communication';
                rtgps.notcommunicatingFilter = VEHICLE_NOT_COMMUNICATING;
            }

            if (rtgps.ignitionstatus == 1) {
                rtgps.ignitionstatusStr = VEHICLE_ON;
                rtgps.ignitionstatusFilter = VEHICLE_RUNNING;

            } else {
                rtgps.ignitionstatusStr = VEHICLE_OFF;
                rtgps.ignitionstatusFilter = VEHICLE_STOPPED;
            }

            if (rtgps.mobilistatus == 1) {
                rtgps.mobilistatusFilter = VEHICLE_ACTIVE;
            } else {
                rtgps.mobilistatusFilter = VEHICLE_IMMOBILIZED;
                rtgps.ignitionstatusFilter = '';
            }

            if(rtgps.carbattery < 2){
                rtgps.devicepulloutFilter = VEHICLE_DEVICE_PULLOUT;
            }

            // checkNoComm(rtgps, function(){
            //     rtgps.notcommunicatingFilter = VEHICLE_NOT_COMMUNICATING;
            //     console.log(rtgps.vehicleno);
            // })
            return vehicleObj;
        };


        function checkNoComm(marker, callback) {
            var currentTime = new Date().getTime();
            var lastSeenAt = marker.timestamp.getTime();
            var noCommThreshold = 8 * 3600 * 1000;
            if (currentTime - lastSeenAt > noCommThreshold) {
                if(callback){
                    callback(marker);
                }
            }
        }

        vm.updateVehicle = function (msg, key) {
            if (msg.length == 2 && msg[0] != null && msg[1] != null) {
                var vehicleObj = vm.processVehicleData(msg);
                //$log.log(vehicleObj);
                if(vehicleObj)
                    vm.callListeners(vehicleObj, key);
            } else {
                $log.log("invalid rtgps data");
            }
        };

        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
        };


        vm.subscribe = function (assetpath, flag, subscriptionKey) {
            var subscriptionMsg = [{path: assetpath}];
            if (flag) {
                //intellicarAPI.mqttService.subscribeAsset(asset, subscriptionKey);
                intellicarAPI.mqttService.subscribe(subscriptionMsg, subscriptionKey);
            } else {
                //intellicarAPI.mqttService.unsubscribeAsset(asset, subscriptionKey);
                intellicarAPI.mqttService.unsubscribe(subscriptionMsg, subscriptionKey);
            }
        };


        vm.handleGetMyVehicles = function (resp) {
            // $log.log(resp);
            vm.vehiclesByPath = resp;
            for (var idx in resp) {
                vm.subscribe(resp[idx].assetpath, true, 'gps');
                vm.subscribe(resp[idx].assetpath, true, 'rtalarm');
                vm.vehiclesByNumber[resp[idx].name] = resp[idx];
            }
        };


        vm.getMyVehicles = function (body) {
            return intellicarAPI.userService.getMyVehiclesMap(body);
        };

        vm.init = function () {
            intellicarAPI.mqttService.addListener('rtgps', vm.updateVehicle);
            vm.getMyVehicles({})
                .then(vm.handleGetMyVehicles, vm.handleFailure);
        };

        vm.init();
    }
})();
