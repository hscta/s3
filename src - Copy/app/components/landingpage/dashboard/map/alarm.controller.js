/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('AlarmController', AlarmController);


    function AlarmController($scope, $log, dialogService, alarmService, DTOptionsBuilder,
                             $timeout, $interval, $q, $filter, intellicarAPI) {
        $log.log('AlarmController');


        var vm = this;
        var dateFormat = 'DD-MM-YY HH:mm';
        dialogService.setTab(3);
        vm.jsonAlarmData = [];
        vm.searchTerm = null;

        vm.convertLatLngToAddr = alarmService.convertLatLngToAddr;


        vm.dtOptions = DTOptionsBuilder.newOptions();

        vm.dtOptions.withOption('paging', false).withOption('scrollY', "58vh").withOption('scrollCollapse', true);


        vm.selectAll = function (data) {
            var filterData;
            var checkStatus;

            if (data == 'vehicle') {
                for (var idx in vm.alarms.filteredVehicles) {
                    filterData = vm.alarms.filteredVehicles;
                    vm.alarms.filteredVehicles[idx].checked = vm.selectAllVehicles;
                }
                vm.deSelectAllVehicles = !vm.selectAllVehicles;
                vm.setSelectedCount('vehicle');
            }
        };

        vm.deSelectAll = function (data) {
            if (data == 'vehicle') {
                for (var idx in vm.alarms.filteredVehicles) {
                    // var filterData = vm.fenceReportObj.filteredItems;
                    vm.alarms.filteredVehicles[idx].checked = false;
                }
                vm.selectAllVehicles = false;
                vm.setSelectedCount('vehicle');
            }
        };

        vm.verifyCheckStatus = function (type) {
            if (type == 'vehicle') {
                var trues = $filter("filter")(vm.alarms.filteredVehicles, {checked: true});
                if (trues.length) {
                    vm.deSelectAllVehicles = false;
                } else {
                    vm.deSelectAllVehicles = true;
                }

                if (trues.length < vm.alarms.filteredVehicles.length)
                    vm.selectAllVehicles = false;
                else if (trues.length == vm.alarms.filteredVehicles.length) {
                    if (vm.alarms.filteredVehicles.length <= 0)
                        vm.selectAllVehicles = false;
                    else
                        vm.selectAllVehicles = true;
                }
            }
            vm.setSelectedCount(type);
        };

        vm.filterVehicles = function () {

            if (!vm.alarms.vehicleFilterPattern) {
                vm.alarms.filteredVehicles = vm.alarms.vehicles;
            } else
                vm.alarms.filteredVehicles = $filter("filter")
                (vm.alarms.vehicles, vm.alarms.vehicleFilterPattern);
            // $log.log(vm.fenceReportObj.filteredItems);

            vm.verifyCheckStatus('vehicle');
        };

        vm.setSelectedCount = function (type) {
            if (type == 'vehicle') {
                if (vm.alarms.filteredVehicles.length)
                    vm.alarms.selectedVehiclesCount = ($filter("filter")
                    (vm.alarms.filteredVehicles, {checked: true})).length;
            }
        };

        vm.init = function () {
            vm.alarms = alarmService.alarmsObj;


            for (var idx in vm.alarms.vehicles) {
                if (!vm.alarms.vehicles[idx].hasOwnProperty('checked'))
                    vm.alarms.vehicles[idx].checked = false;
            }

            if (vm.alarms.filteredVehicles.length)
                vm.alarms.selectedVehiclesCount = ($filter("filter")
                (vm.alarms.filteredVehicles, {checked: true})).length;

            // vm.verifyCheckStatus('vehicle');
            // $log.log(vm.alarms.vehicles);
            //
            // $log.log(vm.alarms.filteredVehicles);

            vm.filterVehicles();

            vm.showAddress();
        };


        vm.getHistory = function () {
            vm.jsonAlarmData = [];
            vm.alarms.alarmResponseData = [];
            alarmService.getAlarmsHistory();

            vm.showAddress();
        };

        vm.showAddress = function () {
            $timeout(function () {
                $('.latlng').webuiPopover({trigger: 'hover', width: 300, animation: 'pop'})
            }, 3000);
        };

        vm.downloadFile = function () {
            vm.jsonAlarmData = [];
            var alarmResp = vm.alarms.alarmResponseData;


            if ( vm.searchTerm != null ) {
                alarmResp = $filter("filter")(vm.alarms.alarmResponseData, {$: vm.searchTerm});
            }

            // $log.log(alarmResp);

            if (alarmResp.length) {
                for (var idx in alarmResp) {
                    var loc = alarmResp[idx].lat + ',' + alarmResp[idx].lng;

                    if ( vm.convertLatLngToAddr ) {
                        loc = alarmResp[idx].addr
                    }

                    var alarmTime = new Date(parseInt(alarmResp[idx].gpstime));
                    vm.jsonAlarmData.push({
                        vehicle_name: alarmResp[idx].vehicleno,
                        time: moment(alarmTime).format(dateFormat),
                        reason: alarmResp[idx].alarmreason,
                        speed: alarmResp[idx].speed,
                        operation_mode: alarmResp[idx].opermode,
                        location: loc
                    });
                }
                intellicarAPI.importFileservice.JSONToCSVConvertor(vm.jsonAlarmData, "Vehicles Alarm Report", true);
            }
        };

        vm.getAddress = function (lat, lng, className) {
            if (vm.convertLatLngToAddr) {

            }else {
                vm.myclass = 'loc' + className;
                // var body = {
                //     data: [[lat, lng]]
                // };

                (intellicarAPI.geocodeService.getAddress([[lat, lng]]))
                    .then(vm.gotAddress, vm.handleFailure);


                // return $q.resolve(promise)
            }

        };



        vm.gotAddress = function (data) {
            // $log.log(data);return;
            if (!data.length) return;

            var addr;
            for (var idx in data)
                addr = data[idx];

            var vehicleAddress = addr[1]

            $('.' + vm.myclass).attr('data-content', vehicleAddress)

            WebuiPopovers.updateContent('.' + vm.myclass, vehicleAddress) //Update the Popover content after the popover is created.
        };



        // $('table').on( 'draw.dt', function (e) {
        //         $log.log(e);
        //         $log.log(e.target.innerText);
        // } );


        angular.element('body').on('search.dt', function() {
            vm.searchTerm = document.querySelector('.dataTables_filter input').value;
            //console.log('dataTables search : ' + vm.searchTerm);
        });


        vm.init();

    }

})();
