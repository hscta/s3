/**
 * Created by smiddela on 12/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userprefService', userprefService);

    function userprefService($log, loginService, intellicarAPI, latlngService, helperService, settingsService ) {
        $log.log("userprefService");
        var vm = this;
        vm.userpref = {};
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


        vm.loginSuccess = function (data) {
            $log.log("loginSuccess");
            $log.log(data);
        };


        vm.handleGetMyInfo = function (resp) {
            //$log.log(resp);
            vm.userpref = resp.data.data[0];
            vm.pgrouppath = helperService.getParentFromPath(vm.userpref.assetpath);
            settingsService.setCurrentGroupPath(vm.pgrouppath);
            $log.log(vm.userpref);
            vm.callListeners(vm.userpref, 'setUserPref');
            //console.log(settingsService.getCurrentGroup());
            //latlngService.geocodeAddress('bhopal');
        };


        vm.handleFailure = function (resp) {
            $log.log("handleFailure");
            $log.log(resp);
        };

        vm.init = function () {
            loginService.addListener('loginSuccess', vm.loginSuccess);
            intellicarAPI.userService.getMyInfo({user:{}})
                .then(vm.handleGetMyInfo, vm.handleFailure);
        };

        vm.init();
    }
})();
