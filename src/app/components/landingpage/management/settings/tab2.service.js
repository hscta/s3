/**
 * Created by smiddela on 22/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('tab2Service', tab2Service);

    function tab2Service($rootScope, $log, $q, intellicarAPI) {
        var vm = this;
        $log.log("tab2Service");

        vm.handleResponse = function (resp) {
            $log.log("tab2Service handleResponse");
            return $q.resolve(resp)
        };

        vm.handleFailure = function (resp) {
            $log.log("tab2Service handleFailure");
            return $q.reject(resp);
        };

        vm.handleMyVehicles = function(data) {
            $log.log("tab2Service handleMyVehicles");
            //$log.log(data);
            return $q.resolve(data);
        };

        vm.handleMyVehiclesFailure = function(data) {
            $log.log("tab2Service handleMyVehiclesFailure");
            return $q.reject(data);
        };


        vm.getMyVehicles = function(body) {
            return intellicarAPI.groupService.getMyVehicles(body)
                .then(vm.handleMyVehicles, vm.handleMyVehiclesFailure);
        }
    }
})();
