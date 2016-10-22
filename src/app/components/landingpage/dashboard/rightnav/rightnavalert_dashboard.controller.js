/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('RightNavDashboardController', RightNavDashboardController);

    function RightNavDashboardController($log, $timeout, rightNavAlertDashboardService,
                                         mapService, geofenceReportService,vehicleService,
                                         intellicarAPI, $q) {
        $log.log("RightNavDashboardController");
        var vm = this;
        vm.alertDetails = [];
        vm.vehicleData = {};
        vm.searchAlertStr = '';
        vm.reports = {};

        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
        };


        vm.getMyGeofenceReports = function (resp) {
            //$log.log(resp);
            vm.reports = geofenceReportService.getMyGeofenceReports();
            //$log.log(vm.reports);

            for(var idx in vm.reports) {
                var subscriptionMsg = [];
                subscriptionMsg.push({fencereport: idx, vehicles:[]});
                for(var eachitem in vm.reports[idx].assg) {
                    subscriptionMsg[0].vehicles.push(vm.reports[idx].assg[eachitem].assetpath);
                }
                intellicarAPI.mqttService.subscribe(subscriptionMsg, 'rtfence');

                //$log.log(subscriptionMsg);
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
            // $log.log(data);
            vm.formatAlertData(data);

            // $log.log(vm.alertDetails);
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


        vm.alertClick = function (alertid) {
            rightNavAlertDashboardService.alertClick(alertid);
        };


        vm.initialize = function () {
            rightNavAlertDashboardService.getDashboardAlerts({})
                .then(vm.getDashboardAlerts, vm.getDashboardAlertsFailure);
        };


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


        // vm.mydata = rightNavAlertDashboardService.updateFenceReport();
        // $log.log(vm.mydata);
        //
        // vm.activeTabData = vm.mydata;

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

        vm.getColorCounter = 0;

        vm.getColor = 'border-top: 1px solid #f00;';
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
            if(vm.getColorCounter == 9){ return getStyle('#d35400'); }
        };
        function getStyle(color) {
            return 'border-top: 2px solid '+color+'; ';
        }
        vm.itemClicked = function (data,level) {
            data.active = !data.active;
            if(level == 3){
                mapService.highlightMarker(vehicleService.vehiclesByNumber[data.vehicleno].assetpath);
            }
        };

        vm.updateFenceReport = function (msg) {
            // console.log(msg);
        };

        rightNavAlertDashboardService.pushDataToController = function (data) {
            vm.activeTabData = data;
            //console.log(data);
        };

        var mapObj = {hours:'h',hour:'h',minutes:'min',minute:'min',days:'d',day:'d',an:'1', 'a few seconds':'1 min',a:'1'};
        var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

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
            return moment.duration(end.diff(start)).humanize().replace(re, function(matched){
                return mapObj[matched];
            });
        };


        vm.returnLength = function(data,level){
            var length = 0;
            if(level == 1){
                for(key in data){
                    for(key2 in data[key]){
                        if(key2 != 'active'){
                            length++;
                        }
                    }
                }
                return length;
            }else if(level == 2){
                for(key in data){
                    if(key != 'active'){
                        length++;
                    }
                }
                return length;
            }
        };

        var vehicleClosed = 0;
        var vehicleOpened = 0;

        vm.returnHeight = function (data) {
            if(data.active){
                vehicleClosed = vehicleOpened = 0;
                for(veh in data){
                    if(veh != 'active'){
                        if(data[veh].active){
                            vehicleOpened++;
                        }else{
                            vehicleClosed++;
                        }
                    }
                }
                return ((vehicleClosed * 37) + (vehicleOpened * 137) + 37 ) + 'px';
            }else{
                return '37px';
            }
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
            // console.log(car);
            if(car.state != vm.RESOLVING){
                if(car.resolved){
                    // Do stuff for un resolving

                    car.state = vm.RESOLVING;
                    $timeout(function () { // Run this without $timeout after getting API response
                        car.state = vm.RESOLVED;
                        car.resolved = false;
                        car.resolveStr = 'resolved';
                    },2000);
                }else{
                    //Do stuff for resolving


                    car.state = vm.RESOLVING;
                    $timeout(function () {// Run this without $timeout after getting API response
                        car.state = vm.UNRESOLVED;
                        car.resolved = true;
                        car.resolveStr = 'unresolved';
                    },2000);
                }
            }
        };

        vm.saveRep = function (rep) {
            if(rep.state != vm.SAVING){
                //console.log('saving...');
                rep.state = vm.SAVING;


                //Do some stuffs to save the report
                $timeout(function () {// Run this without $timeout after getting API response
                    rep.state = vm.SAVED;
                },2000);
            }
        };


        vm.mapServiceUpdate = function (msg) {
            //$log.log('mapServiceUpdate');
            //$log.log(msg);
            if(!(msg.vehicleno in vm.vehicleData)) {
                vm.vehicleData[msg.vehicleno] = {}
            }

            vm.vehicleData[msg.vehicleno].ignitionstatus = msg.ignitionstatus;
        };


        vm.updateFenceReport = function(data) {
            //vm.activeTabData = rightNavAlertDashboardService.getReportData();
        };

        vm.historyGeofenceReports = function(data){
            $log.log(data);
            var date = new Date();
            var startTime = date.setHours(date.getHours() - 24);//1 day before
            var endTime = new Date().getTime();

            var promiseList=[];
            vm.reports =[];
            for ( var idx in data){
                var rep = {};
                rep.reportName = data[idx].name;
                rep.reportId = idx;
                rep.vehiclesAssetPath = [];
                rep.vehicles=[];
                rep.fences=[];

                for ( var vehicle in data[idx].assg){
                    var detail = {
                        id: data[idx].assg[vehicle].assetpath,
                        name: data[idx].assg[vehicle].name,
                    };
                    if (data[idx].assg[vehicle].assgfromassetid == 4) {
                        rep.vehiclesAssetPath.push(data[idx].assg[vehicle].assetpath);
                        rep.vehicles.push(detail);
                    }else if ( data[idx].assg[vehicle].assgfromassetid == 15 ){
                        rep.fences.push(detail);
                    }
                }
                vm.reports.push(rep);

                // $log.log(new Date(startTime), new Date(endTime));
                var body = {
                    fencereport: idx,
                    vehicles: rep.vehiclesAssetPath,
                    starttime: startTime / 1000,
                    endtime: endTime / 1000
                };
                promiseList.push(intellicarAPI.geofenceService.getReportHistory(body));
            }

            return $q.all(promiseList)
                .then(vm.readHistoryInfo, vm.handleFailure);
        };

        vm.readHistoryInfo = function (history) {
            var data = history[0].data.data;
            $log.log(vm.reports);

            $log.log(data);
            if (!data.length) {
                return;
            }

            for ( var details in data ) {
                for ( var idx in vm.reports) {
                    if ( vm.reports[idx].reportId == data[details].reportpath){
                        for ( var fence in vm.reports[idx].fences){
                            if ( vm.reports[idx].fences[fence].id == data[details].fencepath){
                                for ( var vehicle in vm.reports[idx].vehicles){
                                    var myVehicle = vm.reports[idx].vehicles[vehicle];
                                    if ( myVehicle.id == data[details].deviceid){
                                        if ( !(vm.reports[idx].fences[fence][myVehicle.name]))
                                            vm.reports[idx].fences[fence][myVehicle.name]=[];
                                        var startTime = parseInt(data[details].fentry);
                                        var endTime = parseInt(data[details].fexit);
                                        if ((startTime < endTime) && (endTime - startTime) > ( 1000 * 60 * 3 )) {
                                            vm.reports[idx].fences[fence][myVehicle.name].push({
                                                fentry:data[details].fentry,
                                                fexit:data[details].fexit
                                            })
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
            $log.log(vm.reports);
        }

        vm.init = function () {
            //mapService.addListener('rtgps', vm.mapServiceUpdate);
            geofenceReportService.addListener('mygeofencereportsinfo', vm.getMyGeofenceReports);
            //rightNavAlertDashboardService.addListener('updatefencereport', vm.updateFenceReport);
            vm.activeTabData = rightNavAlertDashboardService.getReportData();

            geofenceReportService.addListener('mygeofencereportsinfo', vm.historyGeofenceReports);

        };

        vm.init();
    }
})();


