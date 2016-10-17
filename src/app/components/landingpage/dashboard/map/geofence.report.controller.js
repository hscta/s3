/**
 * Created by User on 22-09-2016.
 */


(function () {
    angular
        .module('uiplatform')
        .controller('GeofenceReportController', GeofenceReportController);

    function GeofenceReportController($log, $q, dialogService, geofenceReportService, $filter, $timeout,
                                      intellicarAPI, historyService) {

        $log.log("GeofenceReportController");

        // $log.log(historyService.playerControls);
        dialogService.setTab(1);
        var vm = this;

        vm.fenceReportObj = historyService.geoFenceReports;

        vm.startTime = vm.fenceReportObj.startTime;
        vm.endTime = vm.fenceReportObj.endTime;

        vm.dataFound = false;

        vm.setSelectedCount = function(type) {
            if ( type == 'vehicle') {
                if ( vm.fenceReportObj.filteredItems.length )
                    vm.fenceReportObj.selectedVehiclesCount =  ($filter("filter")
                    (vm.fenceReportObj.filteredItems, {checked: true})).length;
            }   else {
                if ( vm.fenceReportObj.filteredFenceItems.length)
                    vm.fenceReportObj.selectedFencesCount = ($filter("filter")
                    (vm.fenceReportObj.filteredFenceItems, {checked: true})).length;
            }
        };

        vm.filterVehicles = function(){
            vm.fenceReportObj.filteredItems = $filter("filter")
                (vm.currRep.vehicles, vm.fenceReportObj.vehicleFilter);
            // $log.log(vm.fenceReportObj.filteredItems);
        };

        vm.filterFences = function(){
            vm.fenceReportObj.filteredFenceItems =  $filter("filter")(vm.currRep.fences,  vm.fenceReportObj.fenceFilter);
            // $log.log(vm.fenceReportObj.filteredFenceItems);
        };

        vm.getSelectedFences = function (rep ) {
            vm.fenceReportObj.reportId = rep.assetpath;
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

            vm.fenceReportObj.filteredItems = vm.currRep.vehicles;
            vm.fenceReportObj.filteredFenceItems = vm.currRep.fences;

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
                historyService.geoFenceReports.myHistoryData
            );

            var dateFormatter = new google.visualization.DateFormat({pattern: 'dd-MM-yyyy hh:mm a'});
            dateFormatter.format(data, 2);
            dateFormatter.format(data, 3);

            var table = new google.visualization.Table(document.getElementById('geo-table'));

            table.draw(data, {
                showRowNumber: true,
                width: '100%',
                page: 'enable',
                pageSize: 300,
            });

            google.visualization.events.addListener(table, 'select', function(evt) {
                $log.log(table.getSelection());
                $log.log(data.getValue(table.getSelection()[0].row, 0));
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
            if ( vm.initialSelect ) {
                vm.initialSelect = false;
                vm.fenceReportObj.reports = geofenceReportService.getMyGeofenceReports();
                for (var idx in vm.fenceReportObj.reports) {
                    return  vm.getSelectedFences(vm.fenceReportObj.reports[idx]);
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
                for (var idx in vm.fenceReportObj.filteredItems) {
                    filterData = vm.fenceReportObj.filteredItems;
                    vm.fenceReportObj.filteredItems[idx].checked = vm.selectAllVehicles;
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
                for (var idx in vm.fenceReportObj.filteredItems) {
                    filterData = vm.fenceReportObj.filteredItems;
                    vm.fenceReportObj.filteredItems[idx].checked = false;
                }
                vm.selectAllVehicles = false;
                vm.setSelectedCount('vehicle');
            } else if (data == 'fence') {
                filterData = vm.fenceReportObj.filteredFenceItems;

                for (var idx in vm.fenceReportObj.filteredFenceItems) {
                    vm.fenceReportObj.filteredFenceItems[idx].checked = false;
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

            if (vm.fenceReportObj.startTime && vm.fenceReportObj.endTime) {
                vm.selectedVehicles = [];
                vm.selectedFences = [];
                var promiseList = [];

                vm.vehicleids = [];

                for (var idx in vm.fenceReportObj.filteredItems) {
                    if (vm.fenceReportObj.filteredItems[idx].checked) {
                        vm.selectedVehicles.push(vm.fenceReportObj.filteredItems[idx]);
                        vm.vehicleids.push(vm.fenceReportObj.filteredItems[idx].id);
                    }
                }

                vm.selectedFences = $filter("filter")(vm.fenceReportObj.filteredFenceItems, {checked: true});

                var starttime = new Date(vm.fenceReportObj.startTime).getTime();
                var endtime = new Date(vm.fenceReportObj.endTime).getTime();



                $log.log(starttime, endtime);
                if (endtime <= starttime) {
                    vm.errorMsg = "End time should be >= Start time";
                    return;
                }

                if (!vm.vehicleids.length) {
                    vm.errorMsg = "Select atleast one vehicle";
                    return;
                }

                vm.loadingHistoryData = true;


                // $log.log(vm.fenceReportObj.filteredFenceItems);

                var body = {
                    fencereport: vm.fenceReportObj.reportId,
                    vehicles: vm.vehicleids,
                    starttime: new Date(starttime).getTime() / 1000,
                    endtime: new Date(endtime).getTime() / 1000
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
            historyService.geoFenceReports.myHistoryData = [];

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
                            historyService.geoFenceReports.myHistoryData.push([
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
            vm.showTableData();
        };

        vm.showTableData = function(){
            google.charts.load('current', {'packages': ['table']});
            google.charts.setOnLoadCallback(drawTable);
        };

        vm.init = function () {
            if (historyService.geoFenceReports.myHistoryData.length){
                vm.initialSelect = false;
                vm.showTableData();
            }else {
                vm.initialSelect = true;
            }
            geofenceReportService.addListener('mygeofencereportsinfo', vm.getMyGeofenceReports);
            vm.getMyGeofenceReports();
        };

        //vm.init();
        $timeout(vm.init, 1000);

    }

})();
