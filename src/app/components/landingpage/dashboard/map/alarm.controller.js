/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('AlarmController', AlarmController);


    function AlarmController($scope, $log, dialogService, alarmService,
                             mapService) {
        $log.log('AlarmController');

        var vm = this;
        dialogService.setTab(2);
        vm.alarms = alarmService.alarmsObj;

        vm.selectAll = function (data) {
            var filterData;
            var checkStatus;

            if (data == 'vehicle') {
                for (var idx in vm.alarms.vehicles) {
                    filterData = vm.alarms.vehicles;
                    vm.alarms.vehicles[idx].checked = vm.selectAllVehicles;
                }
                vm.deSelectAllVehicles = !vm.selectAllVehicles;
                vm.setSelectedCount('vehicle');
            } else if (data == 'fence') {
                filterData = vm.fenceReportObj.filteredFenceItems;

                for (var idx in vm.fenceReportObj.filteredFenceItems) {
                    vm.fenceReportObj.filteredFenceItems[idx].checked = vm.selectAllFences;
                }
                vm.fenceReportObj.selectedFencesCount = vm.fenceReportObj.filteredFenceItems.length;
                vm.deSelectAllFences = !vm.selectAllFences;
                vm.setSelectedCount('fence');
            }
        };

        vm.deSelectAll = function (data) {
            if (data == 'vehicle') {
                for (var idx in vm.alarms.vehicles) {
                    // var filterData = vm.alarms.vehicles;
                    vm.alarms.vehicles[idx].checked = false;
                }
                vm.selectAllVehicles = false;
                vm.setSelectedCount('vehicle');
            } else if (data == 'fence') {
                // var filterData = vm.fenceReportObj.filteredFenceItems;

                for (var idx in vm.fenceReportObj.filteredFenceItems) {
                    vm.fenceReportObj.filteredFenceItems[idx].checked = false;
                }
                vm.selectAllFences = false;
                vm.setSelectedCount('fence');
            }

        };




        $log.log(vm.alarms.vehicles);
    }

})();
