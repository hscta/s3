/**
 * Created by smiddela on 20/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('historyService', historyService);

    function historyService($log, mapService, $rootScope, intellicarAPI, $interval) {
        $log.log("historyService");
        var vm = this;

        vm.historyData = {};

        vm.setData = function(key, value) {
            vm.historyData[key] = value;
        };

        vm.setInMapLocation = function (loc) {
            vm.historyMapObj.historyMap.center = angular.copy(loc);
        };

        vm.getData = function(key) {
            if(vm.historyData.hasOwnProperty(key))
                return vm.historyData[key];

            return null;
        };

        vm.historyMapObj = {
            errorMsg : '',
            historyMap : {
                mapOptions: {},
                mapControl: {},
                zoom:'',
                center:''
            },
            historyMapEvents : {
                click: function () {
                    vm.historyMapClickEvent();
                },
            },
            trace:{
                path: [],
                stroke: {color: "blue", weight: 2, opacity: 1},
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                    },
                    offset: '100px',
                    repeat: '100px'
                }],
                clickable: true,
                visible: true,
                geodesic: true,
                fit: true,
                static: true,
                events: {}
            },
            endMarker:{
                options: {},
                events: {
                }
            },
            selectedVehicle:'',
            multiSelect:true,
            circles:[],
            polygons:[],
            fences:[],
            startTime:'',
            endTime:'',
            vehicleNumber:'',
            deviceid:'',
            selectedHistoryVehicle:[],
            dashboardMapObj : {
                clickedMarker:{},
                inMarkers:[]
            },
            getHistory :false,
            historyFenceObj : {
                latitude : '',
                longitude:'',
                name: '',
                other: ''
            },
            historyFenceInfoWindow : {
                show: false,
                control: {},
                options: {
                    maxWidth: 300,
                    disableAutoPan: false,
                    pixelOffset: {
                        width: 0,
                        height: 0
                    }
                }
            },
            historyCircleEvents : {
                click: function (circle, eventName, model, args) {
                    vm.historyCircleEvents (model, vm.historyMapObj.historyFenceObj);
                    vm.historyFenceInfoWindowShow();
                }
            },
            historyPolygonEvents : {
                click: function (polygon, eventName, model, args) {
                    vm.polygonEvents(model, vm.historyMapObj.historyFenceObj);
                    vm.historyFenceInfoWindowShow();
                }
            },
        };

        vm.resetHistoryData = function(){
            vm.historyMapObj.trace.path = [];
            vm.historyMapObj.endMarker = {
                options:{},
                events:{}
            };
            vm.setData('getHistory', false);
        };


        vm.playerControls = {
            slider : 0,
            animationCount : 0,
            ffRate : 1
        };


        vm.geoFenceReports = {
            startTime:'',
            endTime:'',
            reportId:'',
            selectedVehiclesCount : 0,
            selectedFencesCount : 0,

            filteredItems : [],
            filteredFenceItems : [],

            myHistoryData:[],
            jsonReportData:[],
            reports:[],
            fenceFilter:'',
            currRep:[]
        };

        vm.historyCircleEvents = function(model, dest){
            $log.log('clickedhistorycircle', model);
            dest.latitude =  model.center.latitude;
            dest.longitude =  model.center.longitude;
            dest.name =  model.control.info.tagdata.company;
            dest.other =  model.control.info.tagdata.olafilter;
        };

        vm.polygonEvents = function(model, dest){
            var polygonCenter = vm.getPolygonMidPoint(model.control.info.info[0].settingsdata.vertex);
            $log.log(model.control.info.info[0].settingsdata.vertex);
            $log.log(polygonCenter);
            dest.latitude =  polygonCenter.lat();
            dest.longitude =  polygonCenter.lng();
            dest.name =  model.control.info.name;
            dest.other =  model.control.info.tagdata.olafilter;
        };

        vm.getPolygonMidPoint = function (polygon) {
            var bound = new google.maps.LatLngBounds();
            for (var idx in polygon) {
                bound.extend(new google.maps.LatLng(polygon[idx].lat, polygon[idx].lng));
            }
            return bound.getCenter();
        };


        vm.historyFenceInfoWindowShow = function () {
            vm.historyMapObj.historyFenceInfoWindow.show = true;
        };

        vm.historyFenceInfoWindowClose = function () {
            vm.historyMapObj.historyFenceInfoWindow.show = false;
        };

        vm.resetPlayerControls = function(){
            vm.playerControls.slider = 0;
            vm.playerControls.animationCount = 0;
            // vm.playerControls.ffRate = 1;
        };

        vm.getDefaultTime = function(){
            var dateFormat = 'YYYY-MM-DD HH:mm';

            var startTime = moment().subtract(24, 'hour').format(dateFormat);
            var endTime = moment().format(dateFormat);

            return {
                startTime: startTime,
                endTime: endTime
            }
        };

        var MILLISEC = 1000;
        // var hrs6 = 21600 * MILLISEC;
        // var hrs3 = 10800 * MILLISEC;
        // var hrs8 = 28800 * MILLISEC;
        // var hrs12 = 43200 * MILLISEC;
        var hrs24 = 86400 * MILLISEC;
        // var hrs48 = hrs24 * 2;
        var week = hrs24 * 7;
        var timeLimit = week;

        vm.getHistoryData = function(){
            if (!vm.historyMapObj.selectedHistoryVehicle.deviceid){
                vm.historyMapObj.errorMsg = "Please Select Vehicle";
                return;
            }

            if (vm.historyMapObj.startTime && vm.historyMapObj.endTime) {
                if (vm.historyMapObj.startTime.length && vm.historyMapObj.endTime.length) {

                    var starttime = new Date(moment(vm.historyMapObj.startTime).unix()*1000).getTime();
                    var endtime = new Date(moment(vm.historyMapObj.endTime).unix()*1000).getTime();

                    if (endtime - starttime > timeLimit)
                        endtime = starttime + timeLimit;

                    if (endtime <= starttime) {
                        vm.historyMapObj.errorMsg = "End time should be >= Start time";
                        return;
                    }

                    var body = {
                        vehicle: {
                            vehiclepath: vm.historyMapObj.selectedHistoryVehicle.deviceid.toString(),
                            starttime: starttime,
                            endtime: endtime
                        }
                    };

                    intellicarAPI.reportService.getDeviceLocation(body)
                        .then(vm.drawTrace, vm.handleGetLocationFailure);

                } else {
                    vm.historyMapObj.errorMsg = "Enter valid start and end time";
                    return;
                }
            } else {
                // $log.log(vm.historyMapObj.startTime, vm.historyMapObj.endTime);
                vm.historyMapObj.errorMsg = "Enter valid start and end time.";
                return;
            }
        };

        vm.handleGetLocationFailure = function (resp) {
            $log.log("handleGetLocationFailure");
            $log.log(resp);
            vm.historyMapObj.trace.path = [];
        };


        vm.drawTrace = function(resp) {
            var traceData = resp.data.data;
            var path = vm.historyMapObj.trace.path;
            vm.historyMapObj.trace.path = [];

            // console.log(traceData);

            for (var idx in traceData) {
                var position = traceData[idx];

                if (position.latitude.constructor !== Number || position.longitude.constructor !== Number ||
                    position.latitude == 0 || position.longitude == 0
                ) {
                    // $log.log("Not a number");
                    // $log.log(position);
                    continue;
                }
                position.id = vm.historyMapObj.deviceid;
                position.gpstime = parseInt(position.gpstime);
                position.odometer = position.odometer;
                position.speed = parseInt(position.speed.toFixed(2));
                vm.historyMapObj.trace.path.push(position);
            }

            function compare(a, b) {
                return a.gpstime - b.gpstime;
            }

            vm.historyMapObj.trace.path.sort(compare);


            if (vm.historyMapObj.trace.path.length) {
                vm.setData('getHistory', true);
                //$log.log(vm.historyObj.dashboardMapObj.clickedMarker);
                vm.historyMapObj.dashboardMapObj.clickedMarker.latitude = vm.historyMapObj.trace.path[0].latitude;
                vm.historyMapObj.dashboardMapObj.clickedMarker.longitude = vm.historyMapObj.trace.path[0].longitude;

                if (!vm.historyMapObj.dashboardMapObj.clickedMarker.hasOwnProperty('options')) {
                    vm.historyMapObj.dashboardMapObj.clickedMarker.options = {};
                }

                vm.historyMapObj.dashboardMapObj.clickedMarker.options.icons = 'assets/images/markers/big/red-dot.png';
                var midPoint = Math.floor(vm.historyMapObj.trace.path.length / 2);
                vm.historyMapObj.historyMap.center.latitude = vm.historyMapObj.trace.path[midPoint].latitude;
                vm.historyMapObj.historyMap.center.longitude = vm.historyMapObj.trace.path[midPoint].longitude;
                vm.historyMapObj.historyMap.zoom = 11;

                var lastBeacon = vm.historyMapObj.trace.path[vm.historyMapObj.trace.path.length - 1];
                vm.historyMapObj.endMarker.latitude = lastBeacon.latitude;
                vm.historyMapObj.endMarker.options.label = 'E';
                vm.historyMapObj.endMarker.longitude = lastBeacon.longitude;
                vm.historyMapObj.endMarker.options.title = 'End point';

                vm.historyMapObj.errorMsg = '';

                $rootScope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true});
            } else {
                vm.historyMapObj.errorMsg = "No Data Found";
            }
        };

        vm.historyMapClickEvent = function(){
            vm.historyFenceInfoWindowClose();
        };
        vm.init = function(){

            var defaultTime = vm.getDefaultTime ();

            vm.historyMapObj.startTime = defaultTime.startTime;
            vm.historyMapObj.endTime = defaultTime.endTime;

            vm.geoFenceReports.startTime  = defaultTime.startTime;
            vm.geoFenceReports.endTime  = defaultTime.endTime;

            vm.historyMapObj.historyMap.zoom = mapService.getZoom();
            vm.historyMapObj.historyMap.center = mapService.getCenter();


            if ( !vm.historyMapObj.dashboardMapObj.inMarkers.length ) {
                vm.historyMapObj.dashboardMapObj.inMarkers = mapService.inMap.markers.inMarkers;
            }
        };

        vm.init();
    }



})();
