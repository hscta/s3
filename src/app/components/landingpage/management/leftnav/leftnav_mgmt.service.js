/**
 * Created by smiddela on 13/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavManagementService', function ($log, $q, intellicarAPI) {
            $log.log("leftNavManagementService");

            var vm = this;
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


            vm.handleResponse = function (resp) {
                //$log.log("leftNavManagementService handleResponse");
                //$log.log(resp);
                return $q.resolve(resp);
            };


            vm.handleFailure = function (resp) {
                $log.log("leftNavManagementService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };


            vm.getManagementTreeWithUser = function (body) {
                return intellicarAPI.treeDataService.getManagementTreeWithUser(body)
                    .then(vm.handleResponse, vm.handleFailure);
            };

            vm.getManagementTree = function (body) {
                return intellicarAPI.treeDataService.getManagementTree(body)
                    .then(vm.handleResponse, vm.handleFailure);
            };
        });
})();
