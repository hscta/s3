/**
 * Created by smiddela on 23/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('groupService', groupService);

    function groupService($rootScope, $log, $q, requestService, helperService) {
        var vm = this;
        $log.log("groupService");

        vm.handleResponse = function (resp) {
            //$log.log("groupService handleResponse");
            return $q.resolve(resp)
        };


        vm.handleFailure = function (resp) {
            //$log.log("groupService handleFailure ");
            return $q.reject(resp);
        };


        vm.getMyVehicleTree = function (body) {
            $log.log("groupService getMyVehicleTree");
            return requestService.firePost('/user/myvehicles', body)
                .then(vm.handleResponse, vm.handleFailure);

        };


        vm.getMyGroups = function(body) {
            $log.log("groupService getMyGroups");
            return requestService.firePost('/group/mygroups', body)
                .then(helperService.mergeGroupPermissions, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };


        vm.getMyVehicles = function (body) {
            $log.log("groupService getMyVehicles");
            return requestService.firePost('/group/myvehicles', body)
                .then(helperService.mergeVehiclePermissions, vm.handleFailure)
                .then(vm.handleResponse, vm.handleFailure);
        };
    }
})();
