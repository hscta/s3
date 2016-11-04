/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('HistoryController', HistoryController)
        .controller('HistoryTableController', HistoryTableController);


    function HistoryController($scope, $log, $mdDialog, dialogService,
                               $interval, intellicarAPI, historyService,
                               geofenceViewService, $state) {
        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(0);

        vm.historyObj = historyService.historyMapObj;


        var mapObj;

        $scope.getHistory = function () {
            historyService.setData('getHistory', false);

            historyService.getHistoryData();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.resizeMap = function () {
            google.maps.event.trigger(vm.historyObj.historyMap.mapControl.getGMap(), 'resize');
            return true;
        };


        $scope.fitBounds = function () {
            vm.historyObj.trace.fit = true;
        };

        vm.getMyFencesListener = function () {
            //$log.log("getMyFencesListener");
            vm.fences = geofenceViewService.getToDrawFences();
            vm.circles = vm.fences.circles;
            vm.polygons = vm.fences.polygons;
            //$log.log(vm.fences);
        };


        vm.init = function () {
            // $log.log(vm.historyObj.dashboardMapObj.clickedMarker);

            if (vm.historyObj.dashboardMapObj.inMarkers.length) {
                vm.historyObj.dashboardMapObj.clickedMarker = vm.historyObj.dashboardMapObj.inMarkers[0];
            }

            if ($state.params.mapObj) {
                mapObj = $state.params.mapObj;
                historyService.resetHistoryData();
                historyService.historyMapObj.dashboardMapObj.clickedMarker = mapObj.clickedMarker;
                $scope.clickedMarker = vm.historyObj.dashboardMapObj.clickedMarker;
                $scope.inMarkers = vm.historyObj.dashboardMapObj.inMarkers;

                $log.log($scope.clickedMarker);
                vm.historyObj.historyMap.center = vm.historyObj.dashboardMapObj.clickedMarker;
                vm.historyObj.deviceid = vm.historyObj.dashboardMapObj.clickedMarker.deviceid;
                vm.historyObj.vehicleNumber = vm.historyObj.dashboardMapObj.clickedMarker.vehicleno;
                $scope.errorMsg = "";
            }

            if (vm.historyObj.dashboardMapObj.clickedMarker.options) {
                vm.historyObj.dashboardMapObj.clickedMarker.options.animation = null;
            }

            vm.historyObj.dashboardMapObj.clickedMarker.trace = vm.historyObj.trace;
            var selectedVehicle = dialogService.getData('selectedVehicle');
            vm.multiSelect = vm.historyObj.multiSelect;
            vm.circles = vm.historyObj.circles;
            vm.polygons = vm.historyObj.polygons;


            vm.getMyFencesListener();
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
        };
        $interval($scope.resizeMap, 700);

        vm.init();
    }

    function HistoryTableController($rootScope,$scope, $log, dialogService, intellicarAPI, historyService,
                               geofenceViewService) {


        $log.log('HistoryTableController');

        var vm = this;
        dialogService.setTab(1);

        var historyData =[];

        vm.historyObj = historyService.historyMapObj;

        vm.multiSelect = vm.historyObj.multiSelect;

        var MILLISEC = 1000;

        var hrs24 = 86400 * MILLISEC;

        var week = hrs24 * 7;
        var timeLimit = week;

        $scope.getHistory = function () {
            historyService.setData('getHistory', false);

            historyService.getHistoryData();
        };

        $rootScope.$on('gotHistoryEvent', function (event, data) {
            vm.showTableData();
        });

        vm.showTableData = function () {
            var marker = vm.historyObj.trace.path;
            // $log.log(marker);
            historyData=[];

            for ( var idx in marker){
                var loc =  marker[idx].latitude + ', '+ marker[idx].longitude;
                    var time = marker[idx].gpstime;
                var ignitionStatus = marker[idx].ignstatus ? 'On' : 'Off';
                historyData.push([
                   loc,
                    new Date(time),
                    marker[idx].odometer.toString(),
                    marker[idx].speed.toString(),
                    ignitionStatus
                ]);
            }
            google.charts.load('current', {'packages': ['table']});
            google.charts.setOnLoadCallback(drawTable);
        };

        function drawTable() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Location');
            data.addColumn('datetime', 'Time');
            data.addColumn('string', 'Odometer');
            data.addColumn('string', 'Speed');
            data.addColumn('string', 'IgnitionStatus');
            data.addRows(
                historyData
            );

            var dateFormatter = new google.visualization.DateFormat({pattern: 'dd-MM-yyyy hh:mm a'});
            dateFormatter.format(data, 1);

            var table = new google.visualization.Table(document.getElementById('geo-table'));

            table.draw(data, {
                showRowNumber: true,
                width: '100%',
                page: 'enable',
                pageSize: 300
            });
        }

        vm.init = function(){
            if (vm.historyObj.trace.path.length) {
                vm.showTableData();
            }
        };


        vm.init();

    }

})();
