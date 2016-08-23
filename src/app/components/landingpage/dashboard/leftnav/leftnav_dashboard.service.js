/**
 * Created by smiddela on 13/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavDashboardService', function($log, intellicarAPI, $q) {
            $log.log("leftNavDashboardService");

            var vm = this;
            vm.listeners = {};

            vm.handleResponse = function(resp) {
                $log.log("handleResponse");
                $log.log(resp);
            };

            vm.handleFailure = function(resp) {
                $log.log("handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.getMyVehicleTree = function(body) {
                return intellicarAPI.userService.getMyVehicleTree(body)
                    .then(vm.listeners['getMyVehicleTree'], vm.handleFailure);
            };

            vm.getTreeMyVehicles = function(body) {
                return intellicarAPI.treeDataService.getAngularUITreeMyVehicles(body);
            };

            vm.addListener = function(key, listener) {
                vm.listeners[key] = listener;
            };
        });

})();
