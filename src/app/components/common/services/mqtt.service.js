/**
 * Created by smiddela on 28/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mqttService', mqttService);

    function mqttService($log, authService, helperService,
                         $timeout, MQTT_HOST) {
        $log.log("mqttService");

        var vm = this;
    }

})();
