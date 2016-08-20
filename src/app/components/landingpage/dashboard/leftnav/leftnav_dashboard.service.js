/**
 * Created by smiddela on 13/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavDashboardService', function($log, intellicarAPI, $q) {
            var vm = this;
            vm.treeCallback = null;
            $log.log("leftNavDashboardService");

            vm.handleResponse = function(resp) {
                $log.log("handleResponse");
                //$log.log(resp);
                if(vm.treeCallback != null)
                    vm.treeCallback(resp);
                //return $q.resolve(resp)
            };

            vm.handleFailure = function(resp) {
                $log.log("handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.getMyVehicles = function(body) {
                intellicarAPI.userService.getMyVehicles(body)
                    .then(vm.handleResponse, vm.handleFailure);
            };

            vm.addTreeCallback = function(callback) {
                vm.treeCallback = callback;
            }


            vm.addTreeCallback = function(callback) {
                vm.treeCallback = callback;
            }
        });

})();
