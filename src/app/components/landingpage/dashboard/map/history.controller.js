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
            $log.log(vm.historyObj.selectedHistoryVehicle);
            historyService.setData('getHistory', false);

            historyService.getHistoryData();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.resizeMap = function () {
            google.maps.event.trigger(vm.historyObj.historyMap.map , 'resize');
            // google.maps.event.trigger(vm.historyObj.historyMap.mapControl.getGMap(), 'resize');
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

        vm.loadMap = function () {
            vm.historyObj.historyMap.zoom = historyService.historyMapObj.historyMap.zoom;
            vm.historyObj.historyMap.center = historyService.historyMapObj.historyMap.center;
            vm.createMap();
        };

        vm.createMap = function () {
            var mapCanvas = document.getElementById("history_map");

            $log.log(vm.historyObj.historyMap.center.latitude);

            var lat = vm.historyObj.historyMap.center.latitude;
            var lng = vm.historyObj.historyMap.center.longitude;
            vm.historyObj.historyMap.mapOptions = {
                center: new google.maps.LatLng(lat,lng),
                zoom: vm.historyObj.historyMap.zoom
            }
            vm.historyObj.historyMap.map = new google.maps.Map(mapCanvas,
                vm.historyObj.historyMap.mapOptions);

            vm.historyObj.historyMap.map.addListener('click', function() {
                // markerInfowindow.close();
                // fenceInfowindow.close();
            });
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
                // $scope.clickedMarker = vm.historyObj.dashboardMapObj.clickedMarker;
                // $scope.inMarkers = vm.historyObj.dashboardMapObj.inMarkers;

                //$log.log($scope.clickedMarker);
                // vm.historyObj.historyMap.center.latitude = vm.historyObj.dashboardMapObj.clickedMarker.latitude;
                // vm.historyObj.historyMap.center.longitude = vm.historyObj.dashboardMapObj.clickedMarker.longitude;
                // vm.historyObj.deviceid = vm.historyObj.dashboardMapObj.clickedMarker.deviceid;
                vm.historyObj.selectedHistoryVehicle = vm.historyObj.dashboardMapObj.clickedMarker.rtgps;
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

            vm.loadMap();

        };
        $interval($scope.resizeMap, 700);

        vm.init();
    }

    function HistoryTableController($rootScope,$scope, $log, dialogService, intellicarAPI, historyService,
                                    geofenceViewService, $q) {


        $log.log('HistoryTableController');
        //
        // var vm = this;
        // dialogService.setTab(1);
        //
        // var historyData =[];
        // vm.jsonHistoryData = [];
        // var tableContainer = document.getElementById('geo-table');
        //
        // vm.historyObj = historyService.historyMapObj;
        //
        // vm.multiSelect = vm.historyObj.multiSelect;
        //
        // var MILLISEC = 1000;
        //
        // var hrs24 = 86400 * MILLISEC;
        //
        // var week = hrs24 * 7;
        // var timeLimit = week;
        //
        // var table, data;
        //
        // vm.disableDownload = true;
        // vm.showLoading = false;
        //
        // $scope.getHistory = function () {
        //     historyData=[];
        //     vm.jsonHistoryData = [];
        //     vm.disableDownload = true;
        //     vm.showLoading = true;
        //     if ( table)
        //         table.clearChart(tableContainer);
        //
        //     historyService.setData('getHistory', false);
        //
        //     historyService.getHistoryData();
        // };
        //
        // $rootScope.$on('gotHistoryEvent', function (event, data) {
        //     if ( tableContainer == null ) return;
        //     vm.showTableData();
        // });
        //
        // vm.getAddress = function (latlng, className) {
        //     latlng = latlng.split(',');
        //
        //     vm.myclass = className;
        //     var body = {
        //         data: [ latlng]
        //     };
        //     var promise = (intellicarAPI.geocodeService.getAddress(body));
        //
        //     return $q.resolve(promise)
        //         .then(vm.gotAddress, vm.handleFailure);
        // };
        //
        // vm.gotAddress = function(data){
        //     if ( !data.data.data.length ) return;
        //
        //     var addr = data.data.data;
        //
        //     for ( var idx in addr)
        //         addr = addr[idx];
        //
        //     var vehicleAddress = addr[1]
        //
        //     // $log.log(vehicleAddress);
        //
        //     $('.'+vm.myclass).attr('data-content', vehicleAddress)
        //
        //     // console.log(vm.myclass);
        //     WebuiPopovers.updateContent( '.'+vm.myclass,vehicleAddress) //Update the Popover content after the popover is created.
        // };
        //
        // vm.showTableData = function () {
        //     var marker = vm.historyObj.trace.path;
        //     // $log.log(marker);
        //     historyData=[];
        //
        //     for ( var idx in marker){
        //         var loc =  marker[idx].latitude + ','+ marker[idx].longitude;
        //         var dateTime = new Date(marker[idx].gpstime);
        //         var ignitionStatus = marker[idx].ignstatus ? 'On' : 'Off';
        //
        //         var location = "<span class='latlng loc"+idx+"' data-content='Fetching Address'>"+loc+"</span>";
        //
        //         historyData.push([
        //             dateTime,
        //             marker[idx].odometer.toString(),
        //             marker[idx].speed.toString(),
        //             ignitionStatus,
        //             location
        //         ]);
        //
        //         vm.jsonHistoryData.push({
        //             vehicle_Name: vm.historyObj.selectedHistoryVehicle.vehicleno,
        //             location: loc,
        //             time : dateTime.toDateString(),
        //             odometer: marker[idx].odometer.toString(),
        //             speed:marker[idx].speed.toString(),
        //             ignitionStatus: ignitionStatus
        //         });
        //     }
        //     google.charts.load('current', {'packages': ['table']});
        //     google.charts.setOnLoadCallback(drawTable);
        //
        //     vm.disableDownload = false;
        //     vm.showLoading = false;
        //
        //     // $('.latlng').webuiPopover({trigger:'hover',width:300, animation:'pop'});
        // };
        //
        // function drawTable() {
        //     table = new google.visualization.Table(tableContainer);
        //     data = new google.visualization.DataTable();
        //
        //     data.addColumn('datetime', 'Time');
        //     data.addColumn('string', 'Odometer');
        //     data.addColumn('string', 'Speed');
        //     data.addColumn('string', 'IgnitionStatus');
        //     data.addColumn('string', 'Location');
        //
        //     data.addRows(
        //         historyData
        //     );
        //
        //
        //     google.visualization.events.addListener(table, 'ready', function(){
        //         $('.latlng').webuiPopover({trigger:'hover',width:300, animation:'pop'});
        //     });
        //
        //
        //     var dateFormatter = new google.visualization.DateFormat({pattern: 'dd-MM-yyyy hh:mm a'});
        //     dateFormatter.format(data, 1);
        //
        //     table.draw(data, {
        //         showRowNumber: true,
        //         width: '100%',
        //         page: 'enable',
        //         pageSize: 300,
        //         allowHtml:true
        //     });
        //
        //     $('.latlng').hover(function(){
        //         var className = $(this).attr('class');
        //         className = className.split(' ');
        //         var latlng = $(this).text();
        //         vm.getAddress(latlng, className[1]);
        //     });
        // };
        //
        // $scope.downloadFile = function(){
        //     intellicarAPI.importFileservice.JSONToCSVConvertor(vm.jsonHistoryData, "Vehicles History Report", true);
        // };
        //
        // vm.init = function(){
        //     if (vm.historyObj.trace.path.length) {
        //         vm.showTableData();
        //         vm.disableDownload = false;
        //     }
        // };
        //
        // vm.init();
    }

})();
