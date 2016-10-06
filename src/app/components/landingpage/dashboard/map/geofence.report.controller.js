(function () {


    angular
        .module('uiplatform')
        .controller('GeofenceReportController', GeofenceReportController);

    function GeofenceReportController($log, $q, dialogService, geofenceReportService, $filter,
                                      intellicarAPI) {

        $log.log("GeofenceReportController");

        dialogService.setTab(1);
        var vm = this;

        vm.reportId;
        vm.setReport = function (rep) {
            vm.currRep = rep;
            $log.log(rep);
            //vm.currFence = vm.currRep.fences[0];
            vm.currRep = {};
            vm.currRep.vehicles = [];
            vm.currRep.fences = [];

            vm.reportId = rep.assetpath;

            var data = {};
            for ( var idx in rep.assg ) {
                data = {
                    id:rep.assg[idx].assetpath,
                    name:rep.assg[idx].name,
                    checked:false
                };
                if ( rep.assg[idx].assgfromassetid == 4 ){
                    vm.currRep.vehicles.push(data);
                    vm.deSelectAllVehicles = true;
                    vm.SelectAllVehicles = true;
                }else if ( rep.assg[idx].assgfromassetid == 15 ) {
                    data.checked = true;
                    vm.currRep.fences.push(data);
                    vm.deSelectAllFences = false;
                    vm.SelectAllFences = true;
                }
            }

            vm.deSelectAllFences = false;
            vm.selectAllFences = true;
            vm.deSelectAllVehicles = false;
            vm.selectAllVehicles = false;

        };

        vm.setSort = function (id, str) {
            // if (id == vm.tableSort.id) {
            //     if (vm.tableSort.reverse) {
            //         vm.tableSort = {'id': id, 'str': str, 'reverse': false};
            //     } else {
            //         vm.tableSort = {'id': id, 'str': '-' + str, 'reverse': true};
            //     }
            // } else {
            //     vm.tableSort = {'id': id, 'str': str, 'reverse': false};
            // }
        };

        google.charts.load('current', {'packages':['table']});

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

            table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
        }

        vm.getHistory = function (data) {
            dialogService.setData(data, 'selectedVehicle');
            dialogService.show('home.history');
        };


        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
        };


        vm.getMyGeofenceReports = function (resp) {
            //$log.log(resp);
            vm.reports = geofenceReportService.getMyGeofenceReports();
            $log.log(vm.reports);

            vm.currRep = vm.reports[0];
            //vm.currFence = vm.currRep.fences[0];
            //vm.tableSort = {'id': 1, 'str': 'name', 'reverse': false};
        };

        vm.getMyGeofenceReportsMap = function () {
            geofenceReportService.getMyGeofenceReportsMap()
                .then(vm.getMyGeofenceReports, vm.handleFailure);
        };

        vm.selectAll = function (data){
            var filterData;
            var checkStatus;

            if ( data == 'vehicle' ) {
                for ( var idx in vm.filteredItems ) {
                    filterData = vm.filteredItems;
                    vm.filteredItems[idx].checked = vm.selectAllVehicles;
                }
                vm.deSelectAllVehicles =  !vm.selectAllVehicles;;
            }else if ( data == 'fence'){
                filterData = vm.filteredFenceItems;

                for ( var idx in vm.filteredFenceItems ) {
                    vm.filteredFenceItems[idx].checked = vm.selectAllFences;
                }
                vm.deSelectAllFences =  !vm.selectAllFences;;
            }
        };

        vm.deSelectAll = function(data){
            if ( data == 'vehicle' ) {
                for ( var idx in vm.filteredItems ) {
                    filterData = vm.filteredItems;
                    vm.filteredItems[idx].checked = false;
                }
                vm.selectAllVehicles = false;
            }else if ( data == 'fence'){
                filterData = vm.filteredFenceItems;

                for ( var idx in vm.filteredFenceItems ) {
                    vm.filteredFenceItems[idx].checked = false;
                }
                vm.selectAllFences = false;

            }
        };

        vm.verifyCheckStatus = function( type ) {
            $log.log('type', type);
            if ( type == 'vehicle') {
                var trues = $filter("filter")( vm.currRep.vehicles , {checked:true} );
                if ( trues.length ) {
                    vm.deSelectAllVehicles = false;
                }
            }else if ( type == 'fence' ) {
                var trues = $filter("filter")( vm.currRep.fences , {checked:true} );
                if ( trues.length ) {
                    vm.deSelectAllFences = false;
                }
            }

        };

        vm.getHistoryReport = function(){
            var myEl = angular.element( document.querySelector( '#geo-table' ) );
            myEl.empty();
            vm.errorMsg='';

            if (vm.startTime && vm.endTime ) {
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

                $log.log(vm.selectedVehicles.length);

                // for (var idx in vm.filteredFenceItems) {
                //     if (vm.filteredFenceItems[idx].checked) {
                //         vm.selectedFences.push(vm.filteredFenceItems[idx]);
                //     }
                // }

                vm.selectedFences = $filter("filter")( vm.filteredFenceItems, {checked:true} );


                var starttime = new Date(vm.startTime).getTime();
                var endtime = new Date(vm.endTime).getTime();

                if (endtime <= starttime) {
                    vm.errorMsg = "End time should be >= Start time";
                    return;
                }

                vm.loadingHistoryData = true;

                var body = {
                    fencereport: vm.reportId,
                    vehicles: vm.vehicleids,
                    starttime: new Date(vm.startTime).getTime() / 1000,
                    endtime: new Date(vm.endTime).getTime() / 1000
                };
                promiseList.push(intellicarAPI.geofenceService.getReportHistory(body));

                $log.log(vm.selectedFences);

                return $q.all(promiseList)
                    .then(vm.readHistoryInfo, vm.handleFailure);
            }else {
                vm.errorMsg = "Enter valid start and end time";
                return;
            }
        };


        vm.readHistoryInfo = function(history){
            vm.myHistoryData = [];

            var data = history[0].data.data;

            var trackHistoryData = [];

            if ( !data.length ) return;

            for ( var idx in data ) {
                for ( var vehicle in vm.selectedVehicles ) {
                    if ( data[idx].deviceid == vm.selectedVehicles[vehicle].id){
                        var vehicleName = vm.selectedVehicles[vehicle].name
                    }
                }
                for ( var fen in vm.selectedFences ) {
                    var fenceName = vm.selectedFences[fen].name;
                    if ( data[idx].fencepath == vm.selectedFences[fen].id){
                        var startTime = parseInt(data[idx].fentry);
                        var endTime = parseInt(data[idx].fexit);
                        vm.myHistoryData.push([
                            vehicleName,
                            fenceName,
                            new Date(startTime),
                            new Date(endTime)
                        ]);
                        break;
                    }
                }
            }

            vm.loadingHistoryData=false;
            google.charts.setOnLoadCallback(drawTable);
        };

        vm.init = function () {
            geofenceReportService.addListener('mygeofencereportsinfo', vm.getMyGeofenceReports);
            vm.getMyGeofenceReports();
        };


        vm.init();
    }


})();
/**
 * Created by User on 22-09-2016.
 */

