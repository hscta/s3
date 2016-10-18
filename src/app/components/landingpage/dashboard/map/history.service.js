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
            getHistory :false
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
