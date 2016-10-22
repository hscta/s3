/**
 * Created by smiddela on 20/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('alarmService', alarmService);

    function alarmService($log, mapService, intellicarAPI, $filter, $q) {
        $log.log("alarmService");
        var vm = this;


        vm.alarmsObj = {
            vehicles:[],
            startTime:'',
            endTime:'',
            vehicleFilterPattern:'',
            selectedVehiclesCount:0,
            filteredVehicles:[],
            alarmResponseData:[]
        };


        vm.getAlarmsHistory = function(){
            $log.log(vm.alarmsObj.vehicles);

            var selectedVehicles = $filter("filter")(vm.alarmsObj.vehicles, {checked: true});

            var vehiclesids = [];

            $log.log(vm.alarmsObj.filteredVehicles);
            for (var idx in vm.alarmsObj.filteredVehicles) {
                if (vm.alarmsObj.filteredVehicles[idx].checked) {
                    vehiclesids.push(vm.alarmsObj.filteredVehicles[idx].deviceid);
                }
            }

            var promiseList = [];
            var body = {
                vehiclepath : vehiclesids,
                starttime: new Date(vm.alarmsObj.startTime).getTime(),
                endtime: new Date(vm.alarmsObj.endTime).getTime()
            };
            promiseList.push(intellicarAPI.myAlarmService.getAlarmInfo(body));
            return $q.all(promiseList)
                .then(vm.readHistoryInfo, vm.handleFailure);

        };

        vm.readHistoryInfo = function(history){
            var data = history[0].data.data;


            if (!data.length) {
                return;
            }

            vm.alarmResponseData = data;
            $log.log(data);
        };

        vm.handleFailure = function(){
            $log.log('fails');
        }


        function init(){
            var defaultTime = vm.getDefaultTime();

            vm.alarmsObj.startTime = defaultTime.startTime;
            vm.alarmsObj.endTime = defaultTime.endTime;
            vm.alarmsObj.vehicles = mapService.inMap.markers.inMarkers;
            vm.alarmsObj.filteredVehicles = vm.alarmsObj.vehicles;
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
