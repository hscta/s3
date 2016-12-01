/**
 * Created by smiddela on 20/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('alarmService', alarmService);

    function alarmService($log, vehicleService, intellicarAPI, $filter, $q) {
        $log.log("alarmService");
        var vm = this;


        vm.alarmsObj = {
            vehicles:[],
            startTime:'',
            endTime:'',
            vehicleFilterPattern:'',
            selectedVehiclesCount:0,
            filteredVehicles:[],
            alarmResponseData:[],
            loadingAlarmData : false,
            msg:''
        };


        vm.getAlarmsHistory = function(){
            // var selectedVehicles = $filter("filter")(vm.alarmsObj.vehicles, {checked: true});

            var vehiclesids = [];

            // $log.log(vm.alarmsObj.filteredVehicles);
            for (var idx in vm.alarmsObj.filteredVehicles) {
                if (vm.alarmsObj.filteredVehicles[idx].checked) {
                    $log.log(vm.alarmsObj.filteredVehicles[idx]);

                    vehiclesids.push(vm.alarmsObj.filteredVehicles[idx].rtgps.deviceid);
                }
            }

            if ( vehiclesids.length <= 0 ) {
                vm.alarmsObj.msg = "Please Select atleast one vehicle";
                return;
            }

            var MILLISEC = 1000;
            var hrs1 = 3600 * MILLISEC;
            var timeLimit = hrs1;

            var startTime = new Date(moment(vm.alarmsObj.startTime).unix() * 1000).getTime();
            var endTime = new Date(moment(vm.alarmsObj.endTime).unix() * 1000).getTime();


            if ( !startTime ) {
                vm.alarmsObj.msg = "Please enter start time";
                return;
            }

            if ( !endTime ) {
                vm.alarmsObj.msg = "Please enter end time";
                return;
            }

            if (endTime - startTime > timeLimit)
                endTime = startTime + timeLimit;

            if (endTime <= startTime) {
                vm.alarmsObj.msg = "End time should be >= Start time";
                return;
            }

            var promiseList = [];
            vm.alarmsObj.loadingAlarmData = true;

            var body = {
                vehiclepath : vehiclesids,
                starttime: startTime,
                endtime: endTime
            };
            promiseList.push(intellicarAPI.myAlarmService.getAlarmInfo(body));
            vm.alarmsObj.msg = '';

            return $q.all(promiseList)
                .then(vm.readHistoryInfo, vm.handleFailure);

        };

        vm.readHistoryInfo = function(history){
            var data = history[0].data.data;
            vm.alarmsObj.loadingAlarmData = false;

            if (!data.length) {
                return;
            }


            for ( var idx in data ) {
                for ( var veh in vm.alarmsObj.vehicles){
                    if ( data[idx].deviceid == vm.alarmsObj.vehicles[veh].rtgps.deviceid){
                        data[idx].vehicleno = vm.alarmsObj.vehicles[veh].rtgps.vehicleno;
                        data[idx].speed = Math.floor(data[idx].speed);
                    }
                }
            }
            vm.alarmsObj.alarmResponseData = data;
        };


        vm.handleFailure = function(){
            $log.log('fails');
        }


        vm.init = function (){
            var defaultTime = vm.getDefaultTime();

            vm.alarmsObj.startTime = defaultTime.startTime;
            vm.alarmsObj.endTime = defaultTime.endTime;

            for ( var idx in vehicleService.vehiclesByPath) {
                // $log.log(vehicleService.vehiclesByPath[idx]);

                if ( vehicleService.vehiclesByPath[idx].hasOwnProperty('rtgps'))
                    vm.alarmsObj.vehicles.push(vehicleService.vehiclesByPath[idx]);
            }
            // vm.alarmsObj.vehicles =  vehicleService.vehiclesByPath,
            vm.alarmsObj.filteredVehicles = vm.alarmsObj.vehicles;
        };


        vm.getDefaultTime = function(){
            var dateFormat = 'YYYY-MM-DD HH:mm';

            var startTime = moment().subtract(1, 'hour').format(dateFormat);
            var endTime = moment().format(dateFormat);

            return {
                startTime: startTime,
                endTime: endTime
            }
        };

        vm.init();

    }
})();
