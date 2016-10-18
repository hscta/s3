/**
 * Created by smiddela on 20/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('historyService', historyService);

    function historyService($log, mapService) {
        $log.log("historyService");
        var vm = this;

        vm.historyData = {};

        vm.setData = function(key, value) {
            vm.historyData[key] = value;
        };

        vm.getData = function(key) {
            if(vm.historyData.hasOwnProperty(key))
                return vm.historyData[key];

            return null;
        };

        vm.historyMapObj = {
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
                    $log.log('pppppppppppppppppp', model);
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
            reports:[],
            fenceFilter:''
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
