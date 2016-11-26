/**
 * Created by User on 22-09-2016.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geofenceViewService', geofenceViewService);

    function geofenceViewService($log, $q, intellicarAPI, geofenceReportService) {

        var vm = this;
        vm.toolbar = true;
        vm.listeners = {};


        vm.circles = [];
        vm.polygons = [];
        vm.fences = {circles: vm.circles, polygons: vm.polygons};

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
            // $log.log("fence query time = " + (vm.endTime - vm.startTime));
            //$log.log(fenceList);
            for (var idx in fenceList) {
                var fence = fenceList[idx];
                vm.createFenceObjects(fence);
            }
            return vm.drawFences();
        };


        vm.createFenceObjects = function (fence) {
            fence.tagdata = JSON.parse(fence.tagdata);
            for (var idx in fence.info) {
                var infoitem = fence.info[idx];
                infoitem.settingsdata = JSON.parse(infoitem.settingsdata);
                if (infoitem.settingstag === 'GEOFENCE_BOUNDARY') {
                    if (infoitem.settingsdata.fencetype === 'polygon') {
                        var gpolygon = vm.getPolygonFromInfo(infoitem.settingsdata);
                        //gpolygon.info = fence;
                        gpolygon.control.info = fence;
                        //$log.log(gpolygon);
                        vm.polygons.push(gpolygon);
                    } else if (infoitem.settingsdata.fencetype === 'circle') {
                        var gcircle = vm.getCircleFromInfo(infoitem.settingsdata);
                        //gcircle.info = fence;
                        gcircle.control.info = fence;
                        //$log.log(gcircle);
                        vm.circles.push(gcircle);
                    }
                }
            }
            //$log.log(fence);
        };

        var spgreenColor = '#08B21F';
        var blueColor = 'blue';

        vm.getDefaultCircle = function () {
            return {
                center: {},
                radius: 0,
                strokeColor: blueColor,
                strokeWeight: 2,
                strokeOpacity: 1,
                fillColor: blueColor,
                fillOpacity: 0.2,
                clickable: true, // optional: defaults to true
                visible: true, // optional: defaults to true
                control: {}
            }
        };

        vm.getDefaultPolygon = function () {
            return {
                path: [],
                strokeColor: blueColor,
                strokeWeight: 3,
                fillColor: blueColor,
                fillOpacity: 0.2,
                clickable: true,
                visible: true,
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
            vm.fences = {circles: vm.circles, polygons: vm.polygons};
            //$log.log(vm.fences);
            vm.callListeners('getMyFences', vm.fences);
            return vm.fences;
        };


        vm.getToDrawFences = function () {
            return vm.fences;
        };

        vm.applyFilters = function (filterType) {
            vm.callListeners('applyFilters', {filterType: filterType});
        };


        vm.fetchFences = function (fences) {
            vm.circles = [];
            vm.polygons = [];

            var promiseList = [];
            for (var idx in fences) {
                var body = {geofencepath: fences[idx].assetpath};
                promiseList.push(intellicarAPI.geofenceService.getFenceInfoMap(body));
            }

            return $q.all(promiseList)
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
            if (key in vm.listeners) {
                for (var idx in vm.listeners[key]) {
                    vm.listeners[key][idx](data);
                }
            }
        };

        vm.geoData = {};

        vm.setData = function (key, value) {
            vm.geoData[key] = value;
            // $log.log('vm.setData:' + key);
            // $log.log(vm.geoData[key]);
        };

        vm.getData = function (key) {
            if (vm.geoData.hasOwnProperty(key)) {
                //$log.log(vm.geoData[key]);
                return vm.geoData[key];
            }

            return null;
        };
    }


})();
