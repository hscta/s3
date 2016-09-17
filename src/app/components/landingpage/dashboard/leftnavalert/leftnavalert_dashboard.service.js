/**
 * Created by harshas on 17/9/16.
 */

(function(){
    angular
        .module('uiplatform')
        .service('leftNavAlertDashboardService', function($log, intellicarAPI, $q) {
            $log.log("leftNavDashboardAlertService");

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

            vm.getDashboardAlerts = function(body) {
                return intellicarAPI.treeDataService.getDashboardTree(body);
            };

            vm.addListener = function(key, listener) {
                vm.listeners[key] = listener;
            };
        });
})();
