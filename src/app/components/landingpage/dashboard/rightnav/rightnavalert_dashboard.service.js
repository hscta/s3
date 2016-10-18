/**
 * Created by harshas on 17/9/16.
 */

(function () {
    angular
        .module('uiplatform')
        .service('rightNavAlertDashboardService', function ($log, intellicarAPI, $q) {
            $log.log("rightNavDashboardAlertService");

            var vm = this;
            // vm.msgListeners = [];
            vm.listeners = {};


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


            // vm.alertClick = function (alertid) {
            //     for (var eachidx in vm.msgListeners) {
            //         vm.msgListeners[eachidx](alertid);
            //     }
            // };
            //
            //
            // vm.addListener = function (listener) {
            //     if (vm.msgListeners.indexOf(listener) == -1) {
            //         vm.msgListeners.push(listener);
            //     }
            // };


            var data = [{
                vehicleid: 'MH02EH1318',
                vehiclepath: '1/1/3/1',
                deviceid: 4567,
                fencerep: [
                    {
                        fenceid: 1,
                        fencename: 'SNS Motors - Meera Road',
                        reportid: 1234,
                        reportname: 'Mumbai North Service centers',
                        triggerdat: 14024332,
                        triggerloc: 'bng',
                        triggertype: 'entry'
                    }, {
                        fenceid: 2,
                        fencename: 'Royce Nissan - Meera Road',
                        reportid: 1234,
                        reportname: 'Mumbai North Service centers',
                        triggerdat: 14024332,
                        triggerloc: 'bng',
                        triggertype: 'exit'
                    }
                ]
            }, {
                vehicleid: 'MH02EH1233',
                vehiclepath: '1/1/3/1',
                deviceid: 4567,
                fencerep: [
                    {
                        fenceid: 1,
                        fencename: 'Ritu Nissan - Thane',
                        reportid: 234,
                        reportname: 'Thane Service centers',
                        triggerdat: 14024332,
                        triggerloc: 'bng',
                        triggertype: 'entry'
                    }, {
                        fenceid: 2,
                        fencename: 'Ecotech - Thane',
                        reportid: 1234,
                        reportname: 'Thane Service centers',
                        triggerdat: 14024332,
                        triggerloc: 'bng',
                        triggertype: 'exit'
                    }
                ]
            }];



            var reportData = {};


            vm.getReportData = function() {
                return reportData;
            };


            vm.updateFenceReport = function (msg) {
                if (msg == null)
                    return;

                //$log.log(msg);

                var topic = msg[0];
                var data = msg[1];
                //$log.log(data);
                var vehicleno = data.vehicleno;


                for (var eachReport in reportData) {
                    var report = reportData[eachReport];
                    for (var eachFence in report) {
                        var fence = report[eachFence];
                        for (var eachVehicle in fence) {
                            var vehicle = fence[eachVehicle];
                            //$log.log(vehicle);
                            if (vehicle.vehicleno == vehicleno) {
                                //$log.log("Removing " + vehicleno + " from " + vehicle.reportName);
                                delete vehicle;
                                break;
                            }
                        }
                    }
                }


                if (data.activeFences && data.activeFences.length) {
                    //$log.log(msg);
                    for (var idx in data.activeFences) {
                        var activeFence = data.activeFences[idx];
                        var activeinfo = activeFence['activeinfo'];
                        //$log.log(activeinfo);
                        for(var eachitem in activeinfo) {
                            var fenceObj = activeinfo[eachitem];
                            var reportName = activeinfo[eachitem].reportName;
                            var fenceName = activeinfo[eachitem].fenceName;
                            //$log.log("reportname = " + reportName);
                            //$log.log(fenceName);
                            if (!(reportName in reportData)) {
                                reportData[reportName] = {};
                            }

                            if (!(fenceName in reportData[reportName])) {
                                reportData[reportName][fenceName] = {};
                            }

                            if (!(vehicleno in reportData[reportName][fenceName])) {
                                if(fenceObj.reportTypePath.substr(fenceObj.reportTypePath.length - 2) == '38'){
                                    fenceObj.triggerType = true;
                                }else{
                                    fenceObj.triggerType = false;
                                }
                                fenceObj.vehicleno = vehicleno;
                                // fenceObj.vehiclepath = reportData[reportName][fenceName];
                                // console.log(reportData[reportName][fenceName]);
                                //$log.log("Adding " + vehicleno + " to " + reportName);
                                reportData[reportName][fenceName][vehicleno] = fenceObj;
                            }
                        }
                    }
                }
                //vm.pushDataToController(reportData);
                //vm.callListeners('updatefencereport', {});
            };


            vm.addListener = function (key, listener) {
                if (!(key in vm.listeners)) {
                    vm.listeners[key] = [];
                }

                if (vm.listeners[key].indexOf(listener) === -1) {
                    vm.listeners[key].push(listener);
                }
            };


            vm.callListeners = function (msg, key) {
                if (key in vm.listeners) {
                    for (var idx in vm.listeners[key]) {
                        vm.listeners[key][idx](msg, key);
                    }
                }
            };



            vm.init = function () {
                intellicarAPI.mqttService.addListener('rtfence', vm.updateFenceReport);
            };


            vm.init();

        });
})();
