/**
 * Created by harshas on 17/9/16.
 */

(function () {
    angular
        .module('uiplatform')
        .service('rightNavAlertDashboardService', function ($log, intellicarAPI, $q) {
            $log.log("rightNavDashboardAlertService");

            var vm = this;
            vm.msgListeners = [];

            vm.handleResponse = function (resp) {
                //$log.log("leftNavDashboardService handleResponse");
                $log.log(resp);
            };


            vm.handleFailure = function (resp) {
                $log.log("rightNavDashboardService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.getDashboardAlerts = function (body) {
                return intellicarAPI.treeDataService.getDashboardTree(body);
            };

            // vm.addListener = function(key, listener) {
            //     vm.listeners[key] = listener;
            // };


            vm.alertClick = function (alertid) {
                for (var eachidx in vm.msgListeners) {
                    vm.msgListeners[eachidx](alertid);
                }
            };


            vm.addListener = function (listener) {
                if (vm.msgListeners.indexOf(listener) == -1) {
                    vm.msgListeners.push(listener);
                }
            };


            vm.reports = function ( ) {
                var data = [{
                    deviceid:'1234',
                    vehicleid:'ka021234',
                    vehiclepath:'1/1/1/1',
                    fenceid:1,
                    fenceName:'fence1',
                    reportid:1,
                    reportName:'servicecenterreport',
                    triggerdate:'01/01/2017',
                    triggerloc:'bangalore',
                    triggertype:'entry'

                },{
                    deviceid:'4567',
                    vehicleid:'ka024567',
                    vehiclepath:'1/1/3/1/',
                    fenceid:1,
                    fenceName:'fence1',
                    reportid:1,
                    reportName:'servicecenterreport',
                    triggerdate:'01/01/2017',
                    triggerloc:'bangalore',
                    triggertype:'exit'
                },{

                    deviceid:'4567',
                    vehicleid:'ka024567',
                    vehiclepath:'1/1/3/1/',
                    fenceid:12,
                    fenceName:'fence2',
                    reportid:1,
                    reportName:'servicecenterreport',
                    triggerdate:'01/01/2017',
                    triggerloc:'bangalore',
                    triggertype:'entry'
                }
                ];


                var mydata = [];

                for ( var idx in data ) {
                    for ( var key in mydata){
                        if ( mydata[key].reportid == data[idx].reportid ) {
                            for ( var i in mydata[key].fences){
                                if ( mydata[key].fences[i].fenceid == data[idx].fenceid){
                                    mydata[key].fences[i].vehicles.push({
                                                'vehicleid' : data[idx].vehicleid,
                                                'deviceid' : data[idx].deviceid,
                                                'vehiclepath' : data[idx].vehiclepath,
                                                'triggerdate':data[idx].triggerdate,
                                                'triggerloc':data[idx].triggerloc,
                                                'triggertype':data[idx].triggertype
                                            }
                                    );
                                }else {
                                    mydata[key].fences.push({
                                        'fenceid':data[idx].fenceid,
                                        'fenceName':data[idx].fenceName,
                                        'vehicles':[
                                            {
                                                'vehicleid' : data[idx].vehicleid,
                                                'deviceid' : data[idx].deviceid,
                                                'vehiclepath' : data[idx].vehiclepath,
                                                'triggerdate':data[idx].triggerdate,
                                                'triggerloc':data[idx].triggerloc,
                                                'triggertype':data[idx].triggertype
                                            }
                                        ]
                                    });
                                }
                            }
                        }else {
                            mydata.push(vm.saveReportData(data[idx], mydata[0])) ;
                        }
                    }
                    if ( !mydata.length ){
                        mydata.push(vm.saveReportData(data[idx], mydata[0]));
                    }
                }

                return mydata;
            };

            vm.saveReportData = function(src, dest){
                dest = {
                    'reportid' : src.reportid,
                    'reportName' : src.reportName,
                    'fences' : [{
                        'fenceid':src.fenceid,
                        'fenceName':src.fenceName,
                        'vehicles':[
                            {
                                'vehicleid' : src.vehicleid,
                                'deviceid' : src.deviceid,
                                'vehiclepath' : src.vehiclepath,
                                'triggerdate':src.triggerdate,
                                'triggerloc':src.triggerloc,
                                'triggertype':src.triggertype
                            }
                        ]
                    }]
                };
                return dest;
            };


            vm.updateFenceReport = function (msg) {
                //$log.log('updateFenceReport');
                $log.log(msg);

            };


            vm.init = function () {
                //intellicarAPI.mqttService.addListener('rtfence', vm.updateFenceReport);
            };


            vm.init();


        });
})();
