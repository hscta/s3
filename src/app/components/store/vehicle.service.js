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
        vm.listeners = {};
        vm.vehiclesByPath = {};
        vm.vehiclesByNumber = {};


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

        vm.processVehicleData = function (msg) {
            var newData = msg[1];

            if (!(newData.vehiclepath in vm.vehiclesByPath)) {
                //vm.vehiclesByPath[newData.vehiclepath] = msg;
                $log.log("Receiveing data of vehicle not owned by user!!");
                return;
            }

            var vehicleObj = vm.vehiclesByPath[newData.vehiclepath];
            if (!('rtgps' in vehicleObj)) {
                vehicleObj.rtgps = newData;
            }

            var vehicleData = vehicleObj.rtgps;
            //$log.log(msg[0]);
            //$log.log(newData);


            vehicleData.timestamp = new Date(newData.timestamp);
            vehicleData.deviceid = newData.deviceid;
            vehicleData.latitude = newData.latitude;
            vehicleData.longitude = newData.longitude;
            vehicleData.altitude = newData.altitude;
            vehicleData.vehicleno = newData.vehicleno;
            vehicleData.speed = parseFloat(parseFloat(newData.speed).toFixed(2));
            vehicleData.direction = parseFloat(parseFloat(newData.direction).toFixed(2));
            vehicleData.carbattery = parseFloat(parseFloat(newData.carbattery).toFixed(2));
            vehicleData.devbattery = parseFloat(parseFloat(newData.devbattery).toFixed(2));
            vehicleData.ignitionstatus = newData.ignitionstatus;
            vehicleData.mobilistatus = newData.mobilistatus;

            var currentTime = new Date().getTime();

            if (currentTime - vehicleData.timestamp.getTime() > 8 * 3600 * 1000) {
                vehicleData.noComm = 'no communication';
            }

            if (vehicleData.ignitionstatus == 1) {
                vehicleData.ignitionstatusStr = VEHICLE_ON;
                vehicleData.ignitionstatusFilter = VEHICLE_RUNNING;

            } else {
                vehicleData.ignitionstatusStr = VEHICLE_OFF;
                vehicleData.ignitionstatusFilter = VEHICLE_STOPPED;
            }

            if (vehicleData.mobilistatus == 1) {
                vehicleData.mobilistatusFilter = VEHICLE_ACTIVE;
            } else {
                vehicleData.mobilistatusFilter = VEHICLE_IMMOBILIZED;
                vehicleData.ignitionstatusFilter = '';
            }

            return vehicleObj;
        };


        vm.updateVehicle = function (msg, key) {
            if (msg.length == 2 && msg[0] != null && msg[1] != null
                && msg[0] != undefined && msg[1] != undefined) {
                var vehicleObj = vm.processVehicleData(msg);
                //$log.log(vehicleObj);
                vm.callListeners(vehicleObj, key);
            } else {
                $log.log("invalid rtgps data");
            }
        };


        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
        };


        vm.subscribe = function (assetpath, flag) {
            var subscriptionKey = 'gps';
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
            $log.log(resp);
            vm.vehiclesByPath = resp;
            for (var idx in resp) {
                vm.subscribe(resp[idx].assetpath, true);
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
