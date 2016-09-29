/**
 * Created by smiddela on 28/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mqttService', mqttService);

    function mqttService($log, authService, helperService,
                         $timeout, $interval) {
        $log.log("mqttService");

        var vm = this;
        vm.socketiohost = 'http://in3.intellicar.in:10105';
        vm.socket = null;
        vm.msgListeners = [];
        vm.socket = null;
        vm.toggleTestData = false;
        //vm.connected = false;


        vm.initSocket = function () {
            //$log.log('mqtt initSocket');
            if (vm.socket === null) {
                $log.log("Trying to connect to MQTT");
                vm.connect();
                vm.socket.on('connect', vm.onConnect);
                vm.socket.on('close', vm.onClose);
            }

            $timeout(vm.initSocket, 5000);
        };


        vm.onConnect = function () {
            $log.log('Connected to MQTT onConnect');
            if (vm.socket !== null) {
                //vm.connected = true;
                vm.sendToken();
                vm.socket.on('authsuccess', vm.onAuthSuccess);
                vm.socket.on('authfailure', vm.onAuthFailure);
                vm.socket.on('mqtt', vm.onReceiveMsg);
            }
        };


        vm.connect = function () {
            $log.log('mqtt connect');
            vm.socket = io.connect(vm.socketiohost);
        };


        vm.sendToken = function () {
            if (vm.socket) {
                $log.log('mqtt sendToken');
                vm.socket.emit('authtoken', authService.getToken());
            }
        };


        vm.onAuthSuccess = function () {
            $log.log('mqtt authSuccess');
            //vm.socket.emit('subscribe', ['gps', [{path: "vehiclepath"}]]);
            for(var idx in vm.subscriptionList) {
                vm.subscribeChannel(vm.subscriptionList[idx]);
            }
        };


        vm.onAuthFailure = function () {
            $log.log('mqtt authFailure');
            vm.onClose();
        };


        vm.onReceiveMsg = function (msg) {
            //$log.log('mqtt onReceiveMsg');
            //msg = vm.getVehicleData();
            //$log.log(msg);
            for (var eachidx in vm.msgListeners) {
                vm.msgListeners[eachidx](msg);
            }
        };


        vm.onClose = function () {
            $log.log('mqtt onClose');
            vm.socket.close();
            vm.socket = null;
            //vm.connected = false;
        };


        vm.addMsgListener = function (listener) {
            if (vm.msgListeners.indexOf(listener) == -1) {
                vm.msgListeners.push(listener);
            }
        };


        vm.subscriptionList = [];


        vm.subscribe = function(path) {
            if(vm.subscriptionList.indexOf(path) == -1) {
                vm.subscriptionList.push(path);
                vm.subscribeChannel(path);
            }
        };


        vm.unsubscribe = function(path) {
            var index = vm.subscriptionList.indexOf(path);
            if(index > -1) {
                vm.unsubscribeChannel(path);
                vm.subscriptionList.splice(index, 1);
            }
        };

        vm.subscribeChannel = function (path) {
            //$log.log("subscribe: " + path);
            var msg = {};
            msg.data = [];
            msg.data.push(['gps', [{path: path}]]);
            //$log.log(msg);
            vm.socket.emit('subscribe', msg);
        };


        vm.unsubscribeChannel = function (path) {
            $log.log("unsubscribe: " + path);
            var msg = {};
            msg.data = [];
            msg.data.push(['gps', [{path: path}]]);
            //$log.log(msg);
            vm.socket.emit('unsubscribe', msg);
        };


        vm.subscribeAsset = function (asset) {
            vm.subscribe(helperService.getAssetPath(asset));
        };


        vm.unsubscribeAsset = function (asset) {
            vm.unsubscribe(helperService.getAssetPath(asset));
        };


        vm.processVehicleData = function () {
            vm.toggleTestData = !vm.toggleTestData;

            if (vm.toggleTestData) {
                return [{
                    'timebucket': 1473874386000,
                    'lat': 12.9176383,
                    'lng': 77.6480335,
                    'speed': 30,
                    'direction': 0,
                    'satellite': 4,
                    'devicebattery': 2.8,
                    'carbattery': 5
                }];
            }

            return [{
                'timebucket': 1473883275000,
                'lat': 12.9076383,
                'lng': 77.6380335,
                'speed': 70,
                'direction': 0,
                'satellite': 6,
                'devicebattery': 4.2,
                'carbattery': 12
            }];
        };

        vm.initSocket();

        return {
            addMsgListener: vm.addMsgListener,
            subscribeAsset: vm.subscribeAsset,
            unsubscribeAsset: vm.unsubscribeAsset
        }
    }

})();