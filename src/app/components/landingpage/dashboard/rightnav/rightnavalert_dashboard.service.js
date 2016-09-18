/**
 * Created by harshas on 17/9/16.
 */

(function () {
    angular
        .module('uiplatform')
        .service('rightNavAlertDashboardService', function ($log, intellicarAPI, $q) {
            $log.log("rightNavDashboardAlertService");

            var vm = this;
            vm.msgListeners = [];

            vm.handleResponse = function (resp) {
                //$log.log("leftNavDashboardService handleResponse");
                $log.log(resp);
            };


            vm.handleFailure = function (resp) {
                $log.log("rightNavDashboardService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.getDashboardAlerts = function (body) {
                return intellicarAPI.treeDataService.getDashboardTree(body);
            };

            // vm.addListener = function(key, listener) {
            //     vm.listeners[key] = listener;
            // };


            vm.alertClick = function (alertid) {
                for (var eachidx in vm.msgListeners) {
                    vm.msgListeners[eachidx](alertid);
                }
            };


            vm.addListener = function (listener) {
                if (vm.msgListeners.indexOf(listener) == -1) {
                    vm.msgListeners.push(listener);
                }
            };
        });
})();
