/**
 * Created by smiddela on 28/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mqttService', mqttService);

    function mqttService($log, authService, helperService,
                         $timeout) {
        $log.log("mqttService");

        var vm = this;
        vm.socketiohost = 'http://in3.intellicar.in:10105';
        vm.socket = null;
        vm.listeners = {};
        vm.socket = null;
        vm.toggleTestData = false;
        vm.subscriptionList = {};
        vm.authSuccess = false;
        //vm.connected = false;


        vm.initSocket = function () {
            //$log.log('mqtt initSocket');
            if (vm.socket === null) {
                $log.log("Trying to connect to MQTT");
                vm.connect();
                vm.socket.on('connect', vm.onConnect);
                vm.socket.on('close', vm.onClose);
            }

            //$timeout(vm.initSocket, 5000);
        };


        vm.onConnect = function () {
            // $log.log('Connected to MQTT onConnect');
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
                // $log.log('mqtt sendToken');
                vm.socket.emit('authtoken', authService.getToken());
            }
        };


        vm.onAuthSuccess = function () {
            $log.log('mqtt authSuccess');
            vm.authSuccess = true;
            //vm.subscriptionList = {};
            //vm.socket.emit('subscribe', ['gps', [{path: "vehiclepath"}]]);

            for (var key in vm.subscriptionList) {
                vm.subscribeKey(key);
            }
        };


        vm.subscribeKey = function (key) {
            for (var eachitem in vm.subscriptionList[key]) {
                vm.subscribeChannel(vm.subscriptionList[key][eachitem], key);
                //vm.subscribe(vm.subscriptionList[idx][eachitem], idx);
            }
        };


        vm.onAuthFailure = function () {
            $log.log('mqtt authFailure');
            vm.onClose();
        };


        vm.onClose = function () {
            $log.log('mqtt onClose');
            vm.socket.close();
            vm.socket = null;
            //vm.connected = false;
        };


        vm.subscribe = function (path, key) {
            if (!(key in vm.subscriptionList)) {
                vm.subscriptionList[key] = [];
            }

            vm.subscriptionList[key].push(path);
            vm.subscribeChannel(path, key);
        };


        vm.unsubscribe = function (path, key) {
            // var index = vm.subscriptionList.indexOf(path);
            // if (index > -1) {
            //     vm.unsubscribeChannel(path, key);
            //     vm.subscriptionList.splice(index, 1);
            // }
        };

        vm.subscribeChannel = function (path, key) {
//            $log.log("subscribe: " + key + ", " + JSON.stringify(path));
            var msg = {};
            msg.data = [];
            msg.data.push([key, path]);
            //$log.log(msg);
            vm.socket.emit('subscribe', msg);
        };


        vm.unsubscribeChannel = function (path, key) {
            //$log.log("unsubscribe: " + key + ", " + path);
            var msg = {};
            msg.data = [];
            msg.data.push([key, path]);
            //$log.log(msg);
            vm.socket.emit('unsubscribe', msg);
        };


        vm.subscribeAsset = function (path, key) {
            //vm.subscribe(helperService.getAssetPath(asset), key);
            vm.subscribe(path, key);
        };


        vm.unsubscribeAsset = function (path, key) {
            //vm.unsubscribe(helperService.getAssetPath(asset), key);
            vm.unsubscribe(path, key);
        };


        // vm.getSubscriptionMsg = function (path, key) {
        //     switch(key) {
        //         case 'gps':
        //             return [key, [{path: path}]];
        //         case 'fencereport':
        //             return [key, [{fencereport: 'xyz', vehiclelist: ['vehiclepath1', 'vehiclepath2']}]];
        //     }
        // };


        vm.getTopicKey = function (msg) {
            if (msg.length > 0) {
                var tokens = msg[0].split('/');
                if (tokens.length > 2)
                    return tokens[2];
            }

            return null;
        };


        vm.onReceiveMsg = function (msg) {
            //$log.log('mqtt onReceiveMsg');
            //$log.log(JSON.stringify(msg));

            var topicKey = vm.getTopicKey(msg);
            if (topicKey == null) {
                $log.log("Invalid mqtt msg");
                $log.log(msg);
                return;
            }

            //$log.log(topicKey);
            vm.callListeners(msg, topicKey);
        };


        vm.addListener = function (key, listener) {
            if (!(key in vm.listeners)) {
                vm.listeners[key] = [];
            }

            if (vm.listeners[key].indexOf(listener) === -1) {
                vm.listeners[key].push(listener);
                //$log.log("mqtt addlistener: " + key + ", " + listener);
            }
        };


        vm.callListeners = function (msg, key) {
            if (key in vm.listeners) {
                for (var idx in vm.listeners[key]) {
                    vm.listeners[key][idx](msg, key);
                    //$log.log("mqtt call listener: " + key + ", " + idx);
                }
            }
        };


        vm.initSocket();

        return {
            addListener: vm.addListener,
            subscribeAsset: vm.subscribeAsset,
            unsubscribeAsset: vm.unsubscribeAsset,
            subscribe: vm.subscribe,
            unsubscribe: vm.unsubscribe
        }
    }

})();
