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
    }

})();
