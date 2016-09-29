(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geofenceViewService', geofenceViewService);

    function geofenceViewService($log, $q, intellicarAPI, geofenceReportService) {

        var vm = this;
        vm.toolbar = true;
        vm.listeners = {};

        vm.getToolbarVar = function () {
            return vm.toolbar;
        };

        vm.hide = function () {
            vm.toolbar = false;
        };

        vm.show = function () {
            vm.toolbar = true;
        };

        // vm.dialogTab = 0;


        vm.getService = function (id) {
            if (id == 'geofences') {
                return geofenceReportService;
            }
        };


        vm.handleFences = function (resp) {
            $log.log(resp);
        };


        vm.readFenceInfo = function (fenceList) {
            vm.endTime = new Date().getTime();
            $log.log("fence query time = " + (vm.endTime - vm.startTime));
            //$log.log(fence);
            for (var idx in fenceList) {
                var fence = fenceList[idx];
                vm.createFenceObjects(fence);
                vm.fences[fence.assetpath] = fence;
            }
            //$log.log(vm.fences);
            return vm.drawFences();
        };


        vm.createFenceObjects = function (fence) {
            for (var idx in fence.info) {
                var infoitem = fence.info[idx];
                infoitem.settingsdata = JSON.parse(infoitem.settingsdata);
                if (infoitem.settingstag === 'GEOFENCE_BOUNDARY') {
                    if (infoitem.settingsdata.fencetype === 'polygon') {
                        var gpolygon = vm.getPolygonFromInfo(infoitem.settingsdata);
                        gpolygon.info = fence;
                        vm.polygons.push(gpolygon);
                    } else if (infoitem.settingsdata.fencetype === 'circle') {
                        var gcircle = vm.getCircleFromInfo(infoitem.settingsdata);
                        gcircle.info = fence;
                        vm.circles.push(gcircle);
                    }
                }
            }
        };

        var spgreenColor = '#08B21F';
        var blueColor = 'blue';

        vm.getDefaultPolygon = function () {
            return {
                path: [],
                stroke: {
                    color: blueColor,
                    weight: 3
                },
                clickable: true,
                visible: true,
                editable: false,
                draggable: false,
                geodesic: false,
                fill: {
                    color: blueColor,
                    opacity: 0.5
                }
            }
        };


        vm.getDefaultCircle = function () {
            return {
                center: {},
                radius: 0,
                stroke: {
                    color: blueColor,
                    weight: 2,
                    opacity: 1
                },
                fill: {
                    color: blueColor,
                    opacity: 0.5
                },
                clickable: true, // optional: defaults to true
                visible: true, // optional: defaults to true
                editable: false, // optional: defaults to false
                draggable: false, // optional: defaults to false
                geodesic: false, // optional: defaults to false
                control: {}
            }
        };

        vm.getPolygonFromInfo = function (polygonInfo) {
            //$log.log(polygonInfo);
            var gpolygon = vm.getDefaultPolygon();
            for (var idx in polygonInfo.vertex) {
                var latlng = polygonInfo.vertex[idx];
                gpolygon.path.push({latitude: latlng.lat, longitude: latlng.lng});
            }
            return gpolygon;
        };


        vm.getCircleFromInfo = function (circleInfo) {
            //$log.log(circleInfo);
            var gcircle = vm.getDefaultCircle();
            gcircle.center = {latitude: circleInfo.fencecenter.lat, longitude: circleInfo.fencecenter.lng};
            gcircle.radius = circleInfo.fenceradius;
            return gcircle;
        };

        vm.drawFences = function () {
            //$log.log(vm.circles);
            //$log.log(vm.polygons);
            var data = {circles: vm.circles, polygons: vm.polygons};
            vm.callListeners('getMyFences', data);
            return data;
        };

        vm.applyFilters = function (filters) {
            vm.callListeners('applyFilters', filters);
        };


        vm.fetchFences = function (fences) {
            vm.fences = {};
            vm.circles = [];
            vm.polygons = [];

            vm.promiseList = [];
            for (var idx in fences) {
                var body = {geofencepath: fences[idx].assetpath};
                vm.promiseList.push(intellicarAPI.geofenceService.getFenceInfoMap(body));
            }

            return $q.all(vm.promiseList)
                .then(vm.readFenceInfo, vm.handleFailure);
        };


        vm.handleFailure = function (resp) {
            $log.log(resp);
        };


        vm.getMyFences = function () {
            vm.startTime = new Date().getTime();
            return intellicarAPI.userService.getMyFencesMap({})
                .then(vm.fetchFences, vm.handleFailure);
        };


        vm.addListener = function (key, listener) {
            if (!(key in vm.listeners)) {
                vm.listeners[key] = [];
            }

            if (vm.listeners[key].indexOf(listener) === -1) {
                vm.listeners[key].push(listener);
            }
        };


        vm.callListeners = function (key, data) {
            if(key in vm.listeners) {
                for(var idx in vm.listeners[key]) {
                    vm.listeners[key][idx](data);
                }
            }
        };
        //historyService.setData('selectedTab', vm.dialogTab);

        vm.geoData = {};

        vm.setData = function(key, value) {
            vm.geoData[key] = value;
        };

        vm.getData = function(key) {
            if(vm.geoData.hasOwnProperty(key))
                return vm.geoData[key];

            return null;
        }
    }


})();
/**
 * Created by User on 22-09-2016.
 */
