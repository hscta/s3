/**
 * Created by smiddela on 12/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userprefService', userprefService);

    function userprefService($log, loginService, intellicarAPI, latlngService) {
        $log.log("userprefService");
        var vm = this;
        vm.userpref = {};

        vm.loginSuccess = function (data) {
            $log.log("loginSuccess");
            $log.log(data);
        };


        vm.handleGetMyInfo = function (resp) {
            //$log.log(resp);
            vm.userpref = resp.data.data[0];
            // $log.log(vm.userpref);
            latlngService.geocodeAddress('bhopal');
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
