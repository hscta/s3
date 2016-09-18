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
        vm.socketiohost = 'http://in1.intellicar.in:10105';
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


        vm.subscribe = function (path) {
            // $log.log("subscribe: " + path);
            var msg = {};
            msg.data = [];
            msg.data.push(['gps', [{path: path}]]);
            //$log.log(msg);
            vm.socket.emit('subscribe', msg);
        };


        vm.unsubscribe = function (path) {
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
        //$interval(vm.onReceiveMsg, 2000);


        return {
            addMsgListener: vm.addMsgListener,
            subscribeAsset: vm.subscribeAsset,
            unsubscribeAsset: vm.unsubscribeAsset
        }
    }

})();


// vm.latitude = 12.9176383;
// vm.longitude = 77.6480335;
//
// vm.getLat = function (n) {
//     vm.latitude += (n * 0.001);
//     return vm.latitude;
// };
//
// vm.getLng = function (n) {
//     vm.longitude += (n * 0.001);
//     return vm.longitude;
// };
//
//
// vm.pushTestMarkers = function (msg) {
//     var marker = {
//         id: 28,
//         title: '/1/1/1/26/1/27/4/28',
//         latitude: vm.getLat(1),
//         longitude: vm.getLng(1)
//     };
//
//     msg.push(marker);
//
//     marker = {
//         id: 17,
//         title: '/1/1/4/17',
//         latitude: vm.getLat(16),
//         longitude: vm.getLng(16)
//     };
//
//     msg.push(marker);
// };
//
// // vm.onReceiveMsg = function (msg) {
// vm.onReceiveMsgTest = function () {
//     //  $log.log('mqtt onReceiveMsg');
//     var msg = [];
//     vm.pushTestMarkers(msg);
//     //$log.log(msg);
//     for (var eachidx in vm.msgListeners) {
//         vm.msgListeners[eachidx](msg);
//     }
//     //$timeout(vm.onReceiveMsg, 2000);
// };
