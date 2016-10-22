/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('AlarmController', AlarmController);


    function AlarmController($scope, $log, dialogService, alarmService,DTOptionsBuilder,$timeout,
                             mapService, $filter) {
        $log.log('AlarmController');


        var vm = this;
        vm.dtOptions = DTOptionsBuilder.newOptions();
        vm.dtOptions.withOption('paging', false).withOption('scrollY', "430px").withOption('scrollCollapse', true);

        var tempTimeout = $timeout(function () {
            if($('.geoc-body').length > 0){
                var td_heightconsole = ($('.geoc-body').height() - 100) + 'px';
                $timeout.cancel(tempTimeout);
                // vm.dtOptions.withOption('paging', false).withOption('scrollY',td_heightconsole ).withOption('scrollCollapse', true);
            }
        },200)

        dialogService.setTab(2);

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
                var trues = $filter("filter")(vm.alarms.vehicles, {checked: true});
                if (trues.length) {
                    vm.deSelectAllVehicles = false;
                } else {
                    vm.deSelectAllVehicles = true;
                }

                if (trues.length < vm.alarms.vehicles.length)
                    vm.selectAllVehicles = false;
                else if (trues.length == vm.alarms.vehicles.length)
                    vm.selectAllVehicles = true;
            }
            vm.setSelectedCount(type);
        };

        vm.filterVehicles = function () {
            vm.alarms.filteredVehicles = $filter("filter")
            (vm.alarms.vehicles, vm.alarms.vehicleFilterPattern);
            // $log.log(vm.fenceReportObj.filteredItems);
        };

        vm.setSelectedCount = function (type) {
            if (type == 'vehicle') {
                if (vm.alarms.filteredVehicles.length)
                    vm.alarms.selectedVehiclesCount = ($filter("filter")
                    (vm.alarms.filteredVehicles, {checked: true})).length;
            }
        };

        vm.init = function(){
            vm.alarms = alarmService.alarmsObj;

            for ( var idx in vm.alarms.vehicles ){
                if ( !vm.alarms.vehicles[idx].hasOwnProperty('checked'))
                    vm.alarms.vehicles[idx].checked = true;
            }

            vm.getHistory();

            if (vm.alarms.filteredVehicles.length)
                vm.alarms.selectedVehiclesCount = ($filter("filter")
                (vm.alarms.filteredVehicles, {checked: true})).length;


            vm.verifyCheckStatus('vehicle');

        };


        vm.getHistory = function(){
            vm.alarms.alarmResponseData=[];
            alarmService.getAlarmsHistory();
        };

        vm.init();

    }

})();
