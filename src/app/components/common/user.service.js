/**
 * Created by smiddela on 19/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('userService', userService);

    function userService($rootScope, $log, $q, requestService) {
        var vm = this;
        $log.log("userService");

        vm.handleResponse = function (resp) {
            //$log.log("userService handleResponse");
            return $q.resolve(resp)
        };

        vm.handleFailure = function (resp) {
            //$log.log("userService handleFailure ");
            return $q.reject(resp);
        };

        vm.getMyVehicleTree = function (body) {
            $log.log("userService getMyVehicleTree");
            return requestService.firePost('/user/myvehicles', body)
                .then(vm.handleResponse, vm.handleFailure);

        };

        vm.getMyGroups = function(body) {
            $log.log("userService getMyGroups");
            return requestService.firePost('/user/mygroups', body)
                .then(vm.handleResponse, vm.handleFailure);
        }

        vm.getMyVehiclesDash = function (body) {
            $log.log("userService getMyVehiclesDash");
            return requestService.firePost('/user/myvehiclesdash', body)
                .then(vm.handleResponse, vm.handleFailure);
        };

        vm.getMyVehiclesManage = function (body) {
            $log.log("userService getMyVehiclesManage");
            return requestService.firePost('/user/myvehiclesmanage', body)
                .then(vm.handleResponse, vm.handleFailure);
        };

        vm.getMyVehicleWEditView = function(body) {
            $log.log("userService getMyVehicleWEditView");
            return requestService.firePost('/user/myvehiclesweditview', body)
                .then(vm.handleResponse, vm.handleFailure);
        };
    }
})();
