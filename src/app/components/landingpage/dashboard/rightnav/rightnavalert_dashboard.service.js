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


            var mydata = [];

            vm.reports = function ( ) {
                data = [{
                    vehicleid:'ka024567',
                    vehiclepath:'1/1/3/1',
                    deviceid:4567,
                    fencerep:[
                        {
                            fenceid:1,
                            fencename:'fence1',
                            reportid:1234,
                            reportname:'servicecenterreport',
                            triggerdat:14024332,
                            triggerloc:'bng',
                            triggertype:'entry'
                        }, {
                            fenceid:2,
                            fencename:'fence2',
                            reportid:1234,
                            reportname:'servicecenterreport',
                            triggerdat:14024332,
                            triggerloc:'bng',
                            triggertype:'exit'
                        },
                    ]
                },{
                    vehicleid:'ka06787',
                    vehiclepath:'1/1/3/1',
                    deviceid:4567,
                    fencerep:[
                        {
                            fenceid:1,
                            fencename:'fence1',
                            reportid:234,
                            reportname:'servicecenterreport',
                            triggerdat:14024332,
                            triggerloc:'bng',
                            triggertype:'entry'
                        }, {
                            fenceid:2,
                            fencename:'fence2',
                            reportid:1234,
                            reportname:'servicecenterreport',
                            triggerdat:14024332,
                            triggerloc:'bng',
                            triggertype:'exit'
                        },
                    ]
                }];

                var vehicleDet, fenceDet;
                var matchReportId, fenceIdMatch = false;

                for ( var idx in data ){
                    vehicleDet = data[idx];

                    for(var rep in vehicleDet.fencerep){
                        fenceDet = vehicleDet.fencerep[rep];

                        if (mydata.length <= 0){
                            vm.saveReportData(vehicleDet, fenceDet);
                        } else {
                            for(var rep in mydata) {
                                if(mydata[rep].reportid == fenceDet.reportid){
                                    matchReportId = true;

                                    for (var fence in mydata[rep].fences){
                                        var myfence = mydata[rep].fences[fence];
                                        if (myfence.fenceid == fenceDet.fenceid){
                                            fenceIdMatch = true;
                                            myfence.vehicles.push({
                                                vehicleid : vehicleDet.vehicleid,
                                                vehiclepath : vehicleDet.vehiclepath,
                                                deviceid : vehicleDet.deviceid,
                                                triggerdat: fenceDet.triggerdat,
                                                triggerloc: fenceDet.triggerloc,
                                                triggertype:fenceDet.triggertype
                                            });
                                            break;
                                        }else {
                                            fenceIdMatch = false;
                                        }
                                    }

                                    if ( !fenceIdMatch ) {
                                        mydata[rep].fences.push({
                                            fenceid: fenceDet.fenceid,
                                            fencename: fenceDet.fencename,
                                            vehicles : [{
                                                vehicleid : vehicleDet.vehicleid,
                                                vehiclepath : vehicleDet.vehiclepath,
                                                deviceid : vehicleDet.deviceid,
                                                triggerdat: fenceDet.triggerdat,
                                                triggerloc: fenceDet.triggerloc,
                                                triggertype:fenceDet.triggertype
                                            }],
                                        });
                                    }
                                    break;
                                } else {
                                    matchReportId = false;
                                }
                            }
                            if ( !matchReportId ){
                                vm.saveReportData(vehicleDet, fenceDet);
                            }
                        }
                    }
                }
                return mydata;
            };

            vm.saveReportData = function( vehicleDet, fenceDet ) {
                $log.log(fenceDet);
                mydata.push({
                    reportid: fenceDet.reportid,
                    reportname: fenceDet.reportname,
                    fences: [{
                        fenceid: fenceDet.fenceid,
                        fencename: fenceDet.fencename,
                        vehicles : [{
                            vehicleid : vehicleDet.vehicleid,
                            vehiclepath : vehicleDet.vehiclepath,
                            deviceid : vehicleDet.deviceid,
                            triggerdat: fenceDet.triggerdat,
                            triggerloc: fenceDet.triggerloc,
                            triggertype:fenceDet.triggertype
                        }],
                    }]
                });
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
