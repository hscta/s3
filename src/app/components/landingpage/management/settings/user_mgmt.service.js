/**
 * Created by smiddela on 22/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('groupService', groupService);

    function groupService($rootScope, $log, $q, intellicarAPI) {
        var vm = this;
        $log.log("groupService");

        vm.handleResponse = function (resp) {
            $log.log("groupService handleResponse");
            return $q.resolve(resp)
        };

        vm.handleFailure = function (resp) {
            $log.log("groupService handleFailure");
            return $q.reject(resp);
        };

        vm.handleMyVehicles = function(data) {
            $log.log("groupService handleMyVehicles");
            //$log.log(data);
            return $q.resolve(data);
        };

        vm.handleMyVehiclesFailure = function(data) {
            $log.log("groupService handleMyVehiclesFailure");
            return $q.reject(data);
        };


        vm.getMyVehicles = function(body) {
            return intellicarAPI.groupService.getMyVehicles(body)
                .then(vm.handleMyVehicles, vm.handleMyVehiclesFailure);
        }
    }
})();
