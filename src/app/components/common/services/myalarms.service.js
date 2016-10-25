/**
 * Created by harshas on 22/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('myAlarmService', myAlarmService);

    function myAlarmService($log, $q, requestService, helperService) {
        var vm = this;
        $log.log("myAlarmService");


        vm.getAlarmInfo = function (body) {
            var reqbody = {vehicle: body};
            return requestService.firePost('/reports/rtalarm/trackhistorym', reqbody);
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
