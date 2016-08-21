/**
 * Created by smiddela on 13/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavManagementService', function($log, $q, intellicarAPI) {
            $log.log("leftNavManagementService");

            var vm = this;
            vm.listeners = {};

            vm.handleResponse = function(resp) {
                $log.log("handleResponse");
                //$log.log(resp);
                // if(vm.treeCallback != null)
                //     vm.treeCallback(resp);
            };

            vm.handleFailure = function(resp) {
                $log.log("handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.getMyVehicleTree = function(body) {
                intellicarAPI.userService.getMyVehicleTree(body)
                    .then(vm.listeners['getMyVehicleTree'], vm.handleFailure);
            };

            vm.getMyVehiclesDash = function(body) {
                intellicarAPI.userService.getMyVehiclesDash(body)
                    .then(vm.listeners['getMyVehiclesDash'], vm.handleFailure);
            };

            vm.addListener = function(key, listener) {
                vm.listeners[key] = listener;
            };

        });
})();


// vm.treeCallback = null;
// vm.handleResponse = function(resp) {
//     $log.log("handleResponse");
//     $log.log(resp);
//     if(vm.treeCallback != null)
//         vm.treeCallback(resp);
//     //return $q.resolve(resp)
// };
//
// vm.handleFailure = function(resp) {
//     $log.log("handleFailure ");
//     $log.log(resp);
//     return $q.reject(resp);
// };
//
// vm.getMyVehicles = function(body) {
//     intellicarAPI.userService.getMyVehicles(body)
//         .then(vm.handleResponse, vm.handleFailure);
// };
//
// vm.addTreeCallback = function(callback) {
//     vm.treeCallback = callback;
// }
