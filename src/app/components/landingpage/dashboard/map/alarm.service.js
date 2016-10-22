/**
 * Created by smiddela on 20/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('alarmService', alarmService);

    function alarmService($log, mapService) {
        $log.log("alarmService");
        var vm = this;


        vm.alarmsObj = {
            vehicles:[],
            startTime:'',
            endTime:'',
            selectedVehiclesCount:0
        };


        function init(){
            var defaultTime = vm.getDefaultTime();

            vm.alarmsObj.startTime = defaultTime.startTime;
            vm.alarmsObj.endTime = defaultTime.endTime;


            vm.alarmsObj.vehicles = mapService.inMap.markers.inMarkers;
        };


        vm.getDefaultTime = function(){
            var dateFormat = 'YYYY-MM-DD HH:mm';

            var startTime = moment().subtract(24, 'hour').format(dateFormat);
            var endTime = moment().format(dateFormat);

            return {
                startTime: startTime,
                endTime: endTime
            }
        };

        init();

    }
})();
