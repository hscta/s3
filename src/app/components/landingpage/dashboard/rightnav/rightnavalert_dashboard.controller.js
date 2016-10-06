/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('RightNavDashboardController', RightNavDashboardController);

    function RightNavDashboardController($log, rightNavAlertDashboardService,$timeout,
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


        vm.mydata = rightNavAlertDashboardService.updateFenceReport();
        $log.log(vm.mydata);

        vm.activeTabData = vm.mydata;

        vm.activeFilter = 'all';
        vm.finalTabHeightHalf = 35 + 2;// 2 for margin
        vm.finalTabHeight = 160 + 2; // 2 for margin

        vm.isOpened = function (car,data) {
            // if(car.active){
            //     data.childOpened++;
            // }else{
            //     data.childOpened--;
            // }
        };


        vm.resolveFilter = true;
        vm.resolveFilterAll = true;


        // vm.historyTabData = [
        //     {'reportName':'Service Stations', class:'redBG', 'vehicles':[
        //     {'vehicleid':'MH04HN1366', resolved:false, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1303', resolved:true, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1304', resolved:true, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1305', resolved:false, triggerdate:'10/11/16' },
        // ]},
        // {'reportName':'City Limit', class:'redBG', 'vehicles':[
        //     {'vehicleid':'MH02EH1306', resolved:true, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1307', resolved:false, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1308', resolved:true, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1309', resolved:false, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1310', resolved:true, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1311', resolved:true, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1312', resolved:false, triggerdate:'10/11/16' },
        //     {'vehicleid':'MH02EH1313', resolved:false, triggerdate:'10/11/16' },
        // ]}];

        vm.getColorCounter = 0;

        vm.getColor = 'border-top: 1px solid #f00;';;
        vm.getColors = function(){
            vm.getColorCounter++;
            if(vm.getColorCounter == 1){ return getStyle('#2ecc71'); }else
            if(vm.getColorCounter == 2){ return getStyle('#34495e'); }else
            if(vm.getColorCounter == 3){ return getStyle('#3498db'); }else
            if(vm.getColorCounter == 4){ return getStyle('#9b59b6'); }else
            if(vm.getColorCounter == 5){ return getStyle('#1abc9c'); }else
            if(vm.getColorCounter == 6){ return getStyle('#f1c40f'); }else
            if(vm.getColorCounter == 7){ return getStyle('#e67e22'); }else
            if(vm.getColorCounter == 8){ return getStyle('#e74c3c'); }else
            if(vm.getColorCounter == 9){ return getStyle('#d35400'); vm.getColorCounter = 0}
        };
        function getStyle(color) {
            return 'border-top: 2px solid '+color+'; ';
        }
        vm.itemClicked = function (data,id,id2,id3) {
            if(vm.filterActive){
                vm.searching(vm.searchAlertStr,'click',id,id2,id3);
            }else{
                data.active = !data.active;
            }
        };

        vm.updateFenceReport = function (msg) {
            // console.log(msg);
        };

        rightNavAlertDashboardService.pushDataToController = function (data) {
            vm.activeTabData = data;
        };

        vm.getTimeDiff = function (data) {
            var start = data.entry;
            var end = data.exit;
            if(start - end <= 0){
                data.stillActive = true;
                end = new Date();
            }
            start /= 1000;
            end /= 1000;
            start = moment.unix(start);
            end = moment.unix(end);
            return moment.duration(end.diff(start)).humanize();
        };

        vm.returnLength = function(data){
            return Object.keys(data).length -1;
        };

        vm.navFilter = function (data) {
            return true;
        };

        // Functions and variables of Right nav report box

        vm.RESOLVED = 'RESOLVED';
        vm.UNRESOLVED = 'UNRESOLVED';
        vm.RESOLVING = 'RESOLVING';
        vm.SAVING = 'SAVING';
        vm.SAVED = 'SAVED';




        vm.resolutionKeyEvent = function(e,data){
            if(e.ctrlKey && (e.which == 83)) {
                e.preventDefault();
                vm.saveRep(data);
                return false;
            }
            if(e.ctrlKey && (e.which == 13)) {
                e.preventDefault();
                vm.resolve(data);
                return false;
            }
        };

        vm.resolve = function (car) {
            if(car.state != vm.RESOLVING){
                if(car.resolved){
                    // Do stuff for un resolving

                    car.state = vm.RESOLVING;
                    $timeout(function () {
                        car.state = vm.RESOLVED;
                        car.resolved = false;
                        car.resolveStr = 'resolved';
                    },2000);
                }else{
                    //Do stuff for resolving


                    car.state = vm.RESOLVING;
                    $timeout(function () {
                        car.state = vm.UNRESOLVED;
                        car.resolved = true;
                        car.resolveStr = 'unresolved';
                    },2000);
                }
            }
        };

        vm.saveRep = function (rep) {
            if(rep.state != vm.SAVING){
                console.log('saving...');
                rep.state = vm.SAVING;


                //Do some stuffs to save the report
                $timeout(function () {
                    rep.state = vm.SAVED;
                },2000);
            }
        };


        vm.init = function () {
            // intellicarAPI.mqttService.addListener('rtfence', vm.updateFenceReport);
            geofenceReportService.addListener('mygeofencereportsinfo', vm.getMyGeofenceReports);
        };

        vm.init();
    }
})();


