/**
 * Created by harshas on 22/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('myAlarmService', myAlarmService);

    function myAlarmService($log, $q, requestService) {
        var vm = this;
        $log.log("myAlarmService");


        vm.handleGetAlarms = function(resp) {
            if(resp.data && resp.data.data)
                return $q.resolve(resp.data.data);
            return $q.reject(resp);
        };


        vm.handleFailure = function (resp) {
            $log.log(resp);
            return $q.reject(resp);
        };


        vm.getAlarmInfo = function (body) {
            var body = {vehicle: body};
            return requestService.firePost('/reports/rtalarm/trackhistorym', body)
                .then(vm.handleGetAlarms, vm.handleFailure);
        };

        vm.subscribe = function (assetpath, flag) {
            var subscriptionKey = 'gps';
            var subscriptionMsg = [{path: assetpath}];
            if (flag) {
                //intellicarAPI.mqttService.subscribeAsset(asset, subscriptionKey);
                intellicarAPI.mqttService.subscribe(subscriptionMsg, subscriptionKey);
            } else {
                //intellicarAPI.mqttService.unsubscribeAsset(asset, subscriptionKey);
                intellicarAPI.mqttService.unsubscribe(subscriptionMsg, subscriptionKey);
            }
        };

    }

})();
