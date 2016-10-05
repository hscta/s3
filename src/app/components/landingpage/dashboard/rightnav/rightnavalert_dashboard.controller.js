/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('RightNavDashboardController', RightNavDashboardController);

    function RightNavDashboardController($log, rightNavAlertDashboardService,
                                         mapService, geofenceReportService, intellicarAPI) {
        $log.log("RightNavDashboardController");
        var vm = this;
        vm.alertDetails = [];
        vm.inMarkers = [];
        vm.searchAlertStr = '';
        vm.reports = {};

        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
        };


        vm.getMyGeofenceReports = function (resp) {
            //$log.log(resp);
            vm.reports = geofenceReportService.getMyGeofenceReports();
            $log.log(vm.reports);

            for(var idx in vm.reports) {
                var subscriptionMsg = [];
                subscriptionMsg.push({fencereport: idx, vehicles:[]});
                for(var eachitem in vm.reports[idx].assg) {
                    subscriptionMsg[0].vehicles.push(vm.reports[idx].assg[eachitem].assetpath);
                }
                intellicarAPI.mqttService.subscribe(subscriptionMsg, 'rtfence');

                $log.log(subscriptionMsg);
            }

            vm.currRep = vm.reports[0];
            //vm.currFence = vm.currRep.fences[0];
            //vm.tableSort = {'id': 1, 'str': 'name', 'reverse': false};
        };


        // vm.getMyGeofenceReportsMap = function () {
        //     geofenceReportService.getMyGeofenceReportsMap()
        //         .then(vm.getMyGeofenceReports, vm.handleFailure);
        // };



        vm.getDashboardAlerts = function (data) {
            $log.log(data);
            vm.formatAlertData(data);

            $log.log(vm.alertDetails);
        };

        var count = 0;
        vm.formatAlertData = function (data) {
            var details = {};
            for (var i = 0; i < data.length; i++) {
                details = {};
                details.name = data[i].info.name;
                details.assetpath = data[i].info.assetpath;
                details.id = count++;
                vm.alertDetails.push(details);

                if (data[i].items.length)
                    vm.formatAlertData(data[i].items)
            }
        };

        vm.getDashboardAlertsFailure = function (data) {
            $log.log("getDashboardTreeFailure");
            $log.log(data);
        };


        vm.alertResolve2 = function (alertId) {
            $log.log(alertId);
            for (var i = 0; i < vm.alertDetails.length; i++) {
                if (alertId == vm.alertDetails[i].id) {
                    $log.log('matched');
                    vm.alertDetails.splice(i, 1);
                    return;
                }
            }
        };


        vm.alertResolve = function (alertid) {
            $log.log(alertid);
            for (var i = 0; i < vm.inMarkers.length; i++) {
                if (alertid == vm.inMarkers[i].id) {
                    $log.log('matched');
                    vm.inMarkers.splice(i, 1);
                    return;
                }
            }
        };


        vm.updateMarker = function (vehicleData) {
            //$log.log('alertController updateMarker');
            var isNewVehicle = true;
            //var vehicleData = vm.processVehicleData(msg);
            //$log.log(vehicleData);

            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id == vehicleData.id) {
                    vehicleData.options = vm.inMarkers[idx].options;
                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                }
            }

            if (isNewVehicle) {
                vehicleData.options = {};
                vm.inMarkers.push(vehicleData);
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }
        };


        vm.alertClick = function (alertid) {
            rightNavAlertDashboardService.alertClick(alertid);
        };


        vm.addListener = function () {
            //mapService.addMsgListener(vm.updateMarker);
            mapService.addListener('rtgps', vm.updateMarker);
        };


        vm.initialize = function () {
            rightNavAlertDashboardService.getDashboardAlerts({})
                .then(vm.getDashboardAlerts, vm.getDashboardAlertsFailure);
        };


        //vm.initialize();
        vm.addListener();

        vm.collapseAlertPanel = function(panel){
            panel.collapse();
        };

        vm.navAlerts = [
            {
                category:'Hub Report',
                alarms:[{id:'8910'}, {odometer:'40'},{ignition:'On'}, {mobility:'moblized'}]
            }, {
                category:'Geofence',
                alarms:[{id:'1234'}, {odometer:'20'},{ignition:'On'}, {mobility:'moblized'}]
            }, {
                category:'Device pullout',
                alarms:[{id:'4567'}, {odometer:'32'},{ignition:'off'}, {mobility:'moblized'}]
            }, {
                category:'City limit',
                alarms:[{id:'8910'}, {odometer:'40'},{ignition:'On'}, {mobility:'moblized'}]
            }
        ];


        vm.mydata = rightNavAlertDashboardService.reports();

        vm.activeTabData = vm.mydata;

        vm.activeFilter = 'all';
        vm.finalTabHeightHalf = 35 + 2;// 2 for margin
        vm.finalTabHeight = 160 + 2; // 2 for margin

        vm.isOpened = function (car,data) {
            if(car.active){
                data.childOpened++;
            }else{
                data.childOpened--;
            }
        };

        vm.resolve = function (car) {
            if(car.resolved){
                car.resolved = false;
                // Do stuff for un resolving
            }else{
                car.resolved = true;
                //Do stuff for resolving
            }
        };

        vm.saveRep = function (rep) {
            //Do some stuffs to save the report
        };


        vm.historyTabData = [
            {'reportName':'Service Stations', 'vehicles':[
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
            ]},
            {'reportName':'City Limit', class:'redBG', 'vehicles':[
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
                {'vehicleid':'ka1232', triggerdate:'10/11/16' },
            ]}
        ];

        console.log(vm.activeTabData);

        vm.updateFenceReport = function (msg) {
            $log.log(msg);
        };


        vm.init = function () {
            intellicarAPI.mqttService.addListener('rtfence', vm.updateFenceReport);
            geofenceReportService.addListener('mygeofencereportsinfo', vm.getMyGeofenceReports);
        };







        vm.init();
    }
})();


