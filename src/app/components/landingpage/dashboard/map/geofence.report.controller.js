/**
 * Created by User on 22-09-2016.
 */


(function () {
    angular
        .module('uiplatform')
        .controller('GeofenceReportController', GeofenceReportController);

    function GeofenceReportController($log, $q, dialogService, geofenceReportService, $filter,
                                      intellicarAPI) {

        $log.log("GeofenceReportController");

        dialogService.setTab(1);
        var vm = this;

        var dateFormat = 'YYYY/MM/DD HH:mm';
        vm.startTime = moment().subtract(24, 'hour').format(dateFormat);
        vm.endTime = moment().format(dateFormat);
        vm.reportId;

        vm.selectedVehiclesCount = 0;
        vm.selectedFencesCount = 0;

        vm.filteredItems = [];
        vm.filteredFenceItems = [];

        vm.dataFound = false;

        vm.setSelectedCount = function(type) {
            if ( type == 'vehicle') {
                if ( vm.filteredItems.length )
                    vm.selectedVehiclesCount =  ($filter("filter")(vm.filteredItems, {checked: true})).length;
            }   else {
                if ( vm.filteredFenceItems.length)
                    vm.selectedFencesCount = ($filter("filter")(vm.filteredFenceItems, {checked: true})).length;
            }
        };

        vm.filterVehicles = function(){
            vm.filteredItems = $filter("filter")(vm.currRep.vehicles, vm.vehicleFilter);
            $log.log(vm.filteredItems);
        };

        vm.filterFences = function(){
            vm.filteredFenceItems =  $filter("filter")(vm.currRep.fences, vm.fenceFilter);
            $log.log(vm.filteredFenceItems);

        };

        vm.getSelectedFences = function (rep ) {
            $log.log(rep);
            $log.log(typeof(rep));
            vm.reportId = rep.assetpath;
            vm.setReport(rep);
            vm.getHistoryReport();
        };


        vm.setReport = function (rep) {
            vm.currRep = {};
            vm.currRep.vehicles = [];
            vm.currRep.fences = [];


            for (var idx in rep.assg) {
                var data = {
                    id: rep.assg[idx].assetpath,
                    name: rep.assg[idx].name,
                    checked: true
                };

                if (rep.assg[idx].assgfromassetid == 4) {
                    vm.currRep.vehicles.push(data);
                } else if (rep.assg[idx].assgfromassetid == 15) {
                    vm.currRep.fences.push(data);
                }
            }

            vm.filteredItems = vm.currRep.vehicles;
            vm.filteredFenceItems = vm.currRep.fences;

            vm.SelectAllFences = true;
            vm.selectAllVehicles = true;
            vm.deSelectAllFences = false;
            vm.deSelectAllVehicles = false;

            vm.setSelectedCount('fence');
            vm.setSelectedCount('vehicle');
        };



        function drawTable() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Vehicles');
            data.addColumn('string', 'Fence');
            data.addColumn('datetime', 'Fence Entry');
            data.addColumn('datetime', 'Fence Exit');
            data.addRows(
                vm.myHistoryData
            );

            var dateFormatter = new google.visualization.DateFormat({pattern: 'dd-MM-yyyy hh:mm a'});
            dateFormatter.format(data, 2);
            dateFormatter.format(data, 3);

            var table = new google.visualization.Table(document.getElementById('geo-table'));

            table.draw(data, {
                showRowNumber: true,
                width: '100%',
                page: 'enable',
                pageSize: '100%',
            });
        }

        vm.getHistory = function (data) {
            dialogService.setData(data, 'selectedVehicle');
            dialogService.show('home.history');
        };


        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
            vm.loadingHistoryData = false;
        };


        vm.getMyGeofenceReports = function (resp) {
            vm.reports = geofenceReportService.getMyGeofenceReports();

            if ( vm.initialSelect ) {
                vm.initialSelect = false;
                for (var idx in vm.reports) {
                    return  vm.getSelectedFences(vm.reports[idx]);
                }
            }
        };

        vm.getMyGeofenceReportsMap = function () {
            geofenceReportService.getMyGeofenceReportsMap()
                .then(vm.getMyGeofenceReports, vm.handleFailure);
        };

        vm.selectAll = function (data) {
            var filterData;
            var checkStatus;

            if (data == 'vehicle') {
                for (var idx in vm.filteredItems) {
                    filterData = vm.filteredItems;
                    vm.filteredItems[idx].checked = vm.selectAllVehicles;
                }
                vm.deSelectAllVehicles = !vm.selectAllVehicles;
                vm.setSelectedCount('vehicle');
            } else if (data == 'fence') {
                filterData = vm.filteredFenceItems;

                for (var idx in vm.filteredFenceItems) {
                    vm.filteredFenceItems[idx].checked = vm.selectAllFences;
                }
                vm.selectedFencesCount = vm.filteredFenceItems.length;
                vm.deSelectAllFences = !vm.selectAllFences;
                vm.setSelectedCount('fence');
            }
        };

        vm.deSelectAll = function (data) {
            if (data == 'vehicle') {
                for (var idx in vm.filteredItems) {
                    filterData = vm.filteredItems;
                    vm.filteredItems[idx].checked = false;
                }
                vm.selectAllVehicles = false;
                vm.setSelectedCount('vehicle');
            } else if (data == 'fence') {
                filterData = vm.filteredFenceItems;

                for (var idx in vm.filteredFenceItems) {
                    vm.filteredFenceItems[idx].checked = false;
                }
                vm.selectAllFences = false;
                vm.setSelectedCount('fence');
            }

        };

        vm.verifyCheckStatus = function (type) {
            if (type == 'vehicle') {
                var trues = $filter("filter")(vm.currRep.vehicles, {checked: true});
                if (trues.length) {
                    vm.deSelectAllVehicles = false;
                } else {
                    vm.deSelectAllVehicles = true;
                }

                if(trues.length < vm.currRep.vehicles.length)
                    vm.selectAllVehicles = false;
                else if(trues.length == vm.currRep.vehicles.length)
                    vm.selectAllVehicles = true;
            } else if (type == 'fence') {
                var trues = $filter("filter")(vm.currRep.fences, {checked: true});
                if (trues.length) {
                    vm.deSelectAllFences = false;
                } else {
                    vm.deSelectAllFences = true;
                }

                if(trues.length < vm.currRep.fences.length)
                    vm.selectAllFences = false;
                else if(trues.length == vm.currRep.fences.length)
                    vm.selectAllFences = true;
            }

            vm.setSelectedCount(type);
        };

        vm.getHistoryReport = function () {
            vm.dataFound = false;
            var myEl = angular.element(document.querySelector('#geo-table'));
            myEl.empty();
            vm.errorMsg = '';

            if (vm.startTime && vm.endTime) {
                vm.selectedVehicles = [];
                vm.selectedFences = [];
                var promiseList = [];

                vm.vehicleids = [];

                for (var idx in vm.filteredItems) {
                    if (vm.filteredItems[idx].checked) {
                        vm.selectedVehicles.push(vm.filteredItems[idx]);
                        vm.vehicleids.push(vm.filteredItems[idx].id);
                    }
                }

                vm.selectedFences = $filter("filter")(vm.filteredFenceItems, {checked: true});

                var starttime = new Date(vm.startTime).getTime();
                var endtime = new Date(vm.endTime).getTime();

                if (endtime <= starttime) {
                    vm.errorMsg = "End time should be >= Start time";
                    return;
                }

                if (!vm.vehicleids.length) {
                    vm.errorMsg = "Select atleast one vehicle";
                    return;
                }

                vm.loadingHistoryData = true;


                // $log.log(vm.filteredFenceItems);

                var body = {
                    fencereport: vm.reportId,
                    vehicles: vm.vehicleids,
                    starttime: new Date(vm.startTime).getTime() / 1000,
                    endtime: new Date(vm.endTime).getTime() / 1000
                };
                promiseList.push(intellicarAPI.geofenceService.getReportHistory(body));

                return $q.all(promiseList)
                    .then(vm.readHistoryInfo, vm.handleFailure);
            } else {
                vm.errorMsg = "Enter valid start and end time";
                return;
            }
        };


        vm.readHistoryInfo = function (history) {
            vm.myHistoryData = [];

            var data = history[0].data.data;
            var trackHistoryData = [];

            if (!data.length) {
                vm.loadingHistoryData = false;
                vm.dataFound = true;
                return;
            }


            vm.dataFound = false;

            for (var idx in data) {
                for (var vehicle in vm.selectedVehicles) {
                    if (data[idx].deviceid == vm.selectedVehicles[vehicle].id) {
                        var vehicleName = vm.selectedVehicles[vehicle].name
                    }
                }
                for (var fen in vm.selectedFences) {
                    var fenceName = vm.selectedFences[fen].name;
                    if (data[idx].fencepath == vm.selectedFences[fen].id) {
                        var startTime = parseInt(data[idx].fentry);
                        var endTime = parseInt(data[idx].fexit); 
                        if((startTime < endTime) && (endTime - startTime) > ( 1000 * 60 * 3 ) ){
                            vm.myHistoryData.push([
                                vehicleName,
                                fenceName,
                                new Date(startTime),
                                new Date(endTime)
                            ]);
                        }
                        break;
                    }
                }
            }

            vm.loadingHistoryData = false;
            google.charts.load('current', {'packages': ['table']});
            google.charts.setOnLoadCallback(drawTable);
        };

        vm.init = function () {
            geofenceReportService.addListener('mygeofencereportsinfo', vm.getMyGeofenceReports);
            vm.getMyGeofenceReports();

            vm.initialSelect = true;
        };

        vm.init();
    }

})();
