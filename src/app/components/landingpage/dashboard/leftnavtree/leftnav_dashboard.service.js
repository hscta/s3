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
                //$log.log("leftNavDashboardService handleResponse");
                $log.log(resp);
            };


            vm.handleFailure = function(resp) {
                $log.log("leftNavDashboardService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };


            vm.getDashboardTree = function(body) {
                return intellicarAPI.treeDataService.getDashboardTree(body);
            };

            vm.addListener = function(key, listener) {
                vm.listeners[key] = listener;
            };
        });

})();
