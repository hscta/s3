(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('ImmobalizeController', ImmobalizeController);

    function MapController($scope, $log, mapService,
                           $interval, geofenceViewService, $timeout, customMapOverlay,
                           historyService, dialogService, vehicleService) {
        $log.log('MapController');
        var vm = this;

        $scope.searchbox = {
            template: 'searchbox.tpl.html',
            options: {
                // autocomplete:true
            },
            events: {
                places_changed: function (searchBox) {
                    var place = searchBox.getPlaces();
                    if (!place || place == 'undefined' || place.length == 0) {
                        //console.log('no place data :(');
                        return;
                    }

                    var gfmap = vm.inMap.mapControl.getGMap();

                    if (!place[0].geometry) {
                        window.alert("Autocomplete's returned place contains no geometry");
                        return;
                    }

                    // If the place has a geometry, then present it on a map.
                    if (place[0].geometry.viewport) {
                        gfmap.fitBounds(place[0].geometry.viewport);
                    } else {
                        gfmap.setCenter(place[0].geometry.location);
                        gfmap.setZoom(17);  // Why 17? Because it looks good.
                    }
                }
            }
        };


        vm.leftToolbar = function () {
            return geofenceViewService.getToolbarVar();
        };


        vm.inMap = mapService.getMainMap();
        vm.inMarkers = vm.inMap.markers.inMarkers;
        vm.clickedMarkerObj = vm.inMap.markers.clickedMarkerObj;

        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.fenceInfoWindow = vm.inMap.fenceInfoWindow;
        vm.doRebuildAll = false;
        vm.modelsbyref = false;

        vm.filterStr = '';
        vm.excludeFilters = ['icon'];
        vm.infoWindow = {
            show: false,
            control: {},
            options: {
                maxWidth: 300,
                disableAutoPan: false,
                pixelOffset: {
                    width: 0,
                    height: -20
                }
            }
        };

        vm.fenceInfoWindow = {
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
        };


        vm.mapEvents = {
            click: function () {
                vm.infoWindowClose();
                vm.fenceInfoWindowClose();
            },
            zoom_changed: function () {
                vm.changeMarkerIcon();
            }
        };


        vm.changeMarkerIcon = function () {
            for (var idx = 0; idx < vm.inMarkers.length; idx++) {
                // if(!mapService.setMarkerIcon(vm.inMarkers[idx]))
                //     break;
                mapService.setMarkerIcon(vm.inMarkers[idx]);
            }
        };


        vm.markersEvents = {
            click: function (marker, eventName, model, args) {
                vm.clickedMarker = model;

                vm.clickedMarkerObj = {
                    clickedMarker: vm.clickedMarker,
                    showHistory: vm.showHistory
                };

                $log.log(vm.clickedMarkerObj);
                vm.infoWindowShow();
            }
        };
        vm.mapEvents = vm.inMap.mapEvents;

        vm.onRoaded = true;
        vm.offRoaded = false;

        vm.loadMap = function () {
            vm.inMap.zoom = mapService.getZoom();
            vm.inMap.center = mapService.getCenter();
            vm.inMap.bounds = mapService.getBounds();
        };

        vm.resizeMap = function () {
            google.maps.event.trigger(vm.inMap.mapControl.getGMap(), 'resize');
            return true;
        };

        $interval(vm.resizeMap, 500);

        vm.getMarkerCenter = function (marker) {
            return {latitude: marker.latitude, longitude: marker.longitude};
        };

        vm.onRoadCheck = function () {
            //$log.log("onroad check");
            vm.runFilters(vm.filterStr);
            vm.runStats();
        };


        vm.offRoadCheck = function () {
            //$log.log("offroad check");
            vm.runFilters(vm.filterStr);
            vm.runStats();
        };


        vm.checkRoaded = function (marker) {
            if (marker && marker.meta) {
                if (marker.meta.onroad) {
                    if (vm.onRoaded) {
                        return true;
                    }
                } else {
                    if (vm.offRoaded) {
                        return true;
                    }
                }
            }

            // $log.log("false");
            return false;
        };


        vm.updateMarker2 = function (vehicleData) {
            //$log.log('updateMarker2');
            vm.inMarkers.push(vehicleData);
        };

        vm.updateMarker = function (vehicleData) {
            if (vm.inCustomMaker[vehicleData.vehiclepath]) {
                vm.inCustomMaker[vehicleData.vehiclepath].setPosition(vehicleData);
            }

            vm.applyFilterToMarker(vehicleData, vm.filterStr);
        };


        vm.runFilters = function (filterStr) {
            $log.log("runFilters");

            if (vm.filterStr !== filterStr)
                mapService.infoWindowClose();

            vm.filterStr = filterStr;

            //$log.log("applying filters in loop");
            for (var idx in vm.inMarkers) {
                vm.applyFilterToMarker(vm.inMarkers[idx], filterStr);
            }
        };


        vm.applyFilterToMarker = function (marker, filterStr) {
            //$log.log("applying filter to marker");
            if (!vm.matchesAnyMarkerData(marker, filterStr)) {
                marker.options.visible = false;
                if (vm.inCustomMaker[marker.vehiclepath]) {
                    vm.inCustomMaker[marker.vehiclepath].hide();
                }
            } else {
                marker.options.visible = true;
                if (vm.inCustomMaker[marker.vehiclepath]) {
                    vm.inCustomMaker[marker.vehiclepath].show();
                }
            }

            marker.options.visible = vm.checkRoaded(marker) && marker.options.visible;
            if (vm.inCustomMaker[marker.vehiclepath]) {
                if (vm.checkRoaded(marker) && marker.options.visible) {
                    vm.inCustomMaker[marker.vehiclepath].show();
                } else {
                    vm.inCustomMaker[marker.vehiclepath].hide();
                }
            }

            // if (marker.options.visible && (!marker.ignitionstatus)) {
            //     $log.log(marker);
            // }

            return marker.options.visible;
        };


        vm.matchesAnyMarkerData = function (marker, filterStr) {
            for (var eachidx in marker) {
                if (vm.excludeFilters.indexOf(eachidx) != -1)
                    continue;

                if (marker[eachidx]) {
                    var lowercasefilterStr = filterStr.toString().toLowerCase();
                    var lowercaseMarkerStr = marker[eachidx].toString().toLowerCase();

                    if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                        // if ((!marker.ignitionstatus && marker.options.visible)) {
                        //     $log.log(lowercasefilterStr + " = " + lowercaseMarkerStr);
                        // }
                        return true;
                    }
                }
            }

            //$log.log("not matching " + marker.id);
            return false;
        };


        vm.vehicleStats = {
            showall: 0,
            running: 0,
            stopped: 0,
            active: 0,
            immobilized: 0
        };


        vm.runStats = function () {
            for (var filter in vm.vehicleStats) {
                if (filter === 'showall') {
                    vm.vehicleStats[filter] = vm.getStats(filter);
                } else {
                    vm.vehicleStats[filter] = vm.getStats(filter);
                }
            }

            // $log.log(vm.vehicleStats);
        };

        vm.getStats = function (filterStr) {
            var count = 0;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (vm.checkRoaded(marker)) {
                    if (vm.matchesAnyMarkerData(marker, filterStr)) {
                        count++;
                    } else {
                        if (filterStr === "showall") {
                            count++;
                        }
                    }
                }
            }

            //$log.log("Filtered vehicles = " + count);
            return count;
        };


        vm.geoFilters = {
            showAll: true,
            parkingLot: true,
            serviceStation: true,
            competitorHub: true,
            cityLimits: false,
            carBattery: false,
            devBattery: false,
            noComm: false,
        };

        geofenceViewService.setData('geoFilters', vm.geoFilters);

        var PARKING = 'parking';
        var SERVICE_STATION = 'servicestation';
        var COMPETITOR_HUB = 'competitor';
        var CITY_LIMIT = 'citylimit';

        var DEFAULT_STROKE = 10;
        var MIN_STROKE = 3;


        vm.getMyFencesListener = function (fences) {
            $log.log('mapcontroller');
            // $log.log(fences);
            // vm.inMap.circles = fences.circles;
            mapService.inMap.circles = fences.circles;
            // vm.inMap.polygons = fences.polygons;
            mapService.inMap.polygons = fences.polygons;
            // $log.log("calling geofenceViewService.setData");
            geofenceViewService.setData('geofences', true);
            vm.applyFilters({filterType: 'showAll'});
        };

        var DEVBATTERY_THRESHOLD = 3.55;
        var CARBATTERY_THRESHOLD = 9.5;

        vm.applyFilters = function (filterData) {
            var idx;
            var marker;

            if (filterData.filterType == 'carBattery') {
                if (vm.geoFilters.carBattery) {
                    // do some code to add low battery
                    for (idx in vm.inMarkers) {
                        marker = vm.inMarkers[idx];
                        if (marker.carbattery < CARBATTERY_THRESHOLD) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                        }
                    }
                } else {
                    // do some code to remove low battery
                    for (idx in vm.inMarkers) {
                        marker = vm.inMarkers[idx];
                        marker.options.animation = null;
                        if (vm.geoFilters.devBattery && marker.devbattery < DEVBATTERY_THRESHOLD) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                        }
                    }
                }
            } else if (filterData.filterType == 'devBattery') {
                if (vm.geoFilters.devBattery) {
                    // do some code to add low battery
                    for (idx in vm.inMarkers) {
                        marker = vm.inMarkers[idx];
                        if (marker.devbattery < DEVBATTERY_THRESHOLD) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                        }
                    }
                } else {
                    // do some code to remove low battery
                    for (idx in vm.inMarkers) {
                        marker = vm.inMarkers[idx];
                        marker.options.animation = null;
                        if (vm.geoFilters.carBattery && marker.carbattery < CARBATTERY_THRESHOLD) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                        }
                    }
                }
            } else if (filterData.filterType == 'noComm') {
                for (idx in vm.inMarkers) {
                    marker = vm.inMarkers[idx];
                    if (vm.geoFilters.noComm) {
                        var currentTime = new Date().getTime();
                        var lastSeenAt = marker.timestamp.getTime();
                        var noCommThreshold = 8 * 3600 * 1000;
                        //$log.log("currentTime: " + currentTime);
                        //$log.log("lastSeenAt: " + lastSeenAt);
                        if (currentTime - lastSeenAt > noCommThreshold) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                        }
                    }
                    else {
                        marker.options.animation = null;
                    }
                }
            } else {
                if (vm.inMap.circles) {
                    //$log.log(vm.inMap.circles);
                    for (idx = 0; idx < vm.inMap.circles.length; idx++) {
                        var filterStr = vm.inMap.circles[idx].control.info.tagdata;
                        // $log.log(filterData.filterType + ", checkfilterstr = " + checkFilterString(filterStr));
                        if (checkFilterString(filterStr)) {
                            vm.inMap.circles[idx].visible = true;
                            vm.inMap.circles[idx].stroke.weight = getStroke(filterStr);
                            vm.inMap.circles[idx].stroke.color = getColor(filterStr);
                            startAnimation(vm.inMap.circles[idx]);
                        } else {
                            vm.inMap.circles[idx].visible = false;
                            console.log(mapService.inMap.circles[idx]);
                            console.log(idx);
                        }
                    }
                }

                if (vm.inMap.polygons) {
                    for (idx = 0; idx < vm.inMap.polygons.length; idx++) {
                        filterStr = vm.inMap.polygons[idx].control.info.tagdata;
                        // $log.log(filterData.filterType + ", checkfilterstr = " + checkFilterString(filterStr));
                        if (checkFilterString(filterStr)) {
                            vm.inMap.polygons[idx].visible = true;
                            vm.inMap.polygons[idx].stroke.weight = getStroke(filterStr);
                            vm.inMap.polygons[idx].stroke.color = getColor(filterStr);
                            startAnimation(vm.inMap.polygons[idx]);
                        } else {
                            vm.inMap.polygons[idx].visible = false;
                            if (filterData.filterType == 'cityLimits') {
                                // $log.log(filterData.filterType + " == check == " + vm.polygons[idx].visible);
                            }
                        }
                    }
                }
            }
        };

        function getColor(str) {
            var type = getType(str);
            if (type == PARKING) {
                return 'black';
            } else if (type == SERVICE_STATION) {
                //return '#f89406';
                return 'blue';
            } else if (type == COMPETITOR_HUB) {
                return 'red';
            } else if (type == CITY_LIMIT) {
                return 'blue';
            }
        }

        function getStroke(str) {
            var type = getType(str);
            if (type == PARKING) {
                return DEFAULT_STROKE;
            } else if (type == SERVICE_STATION) {
                return DEFAULT_STROKE;
            } else if (type == COMPETITOR_HUB) {
                return DEFAULT_STROKE;
            } else if (type == CITY_LIMIT) {
                return MIN_STROKE;
            }
        }

        function startAnimation(obj) {
            var count = 0;
            //$log.log(getType(obj.control.info.tagdata));
            if (getType(obj.control.info.tagdata) !== CITY_LIMIT) {
                $interval(function () {
                    count++;
                    if (count % 2 == 0)
                        obj.stroke.weight = DEFAULT_STROKE;
                    else
                        obj.stroke.weight = MIN_STROKE;

                }, 500, 4);
            }
        }

        function getType(tagdata) {
            var str = tagdata.olafilter;

            if (str.match(/parking/g) && str.match(/parking/g).length > 0)
                return PARKING;
            if (str.match(/servicestation/g) && str.match(/servicestation/g).length > 0)
                return SERVICE_STATION;
            if (str.match(/competitor/g) && str.match(/competitor/g).length > 0)
                return COMPETITOR_HUB;
            if (str.match(/citylimit/g) && str.match(/citylimit/g).length > 0)
                return CITY_LIMIT;

            return null;
        }


        function checkFilterString(tagdata) {
            var str = tagdata.olafilter;

            //$log.log("olafilter = " + str);
            if (vm.geoFilters.parkingLot && str.match(/parking/g) && str.match(/parking/g).length > 0) {
                // $log.log("vm.geoFilters.parkingLot = " + vm.geoFilters.parkingLot);
                return true;
            }

            if (vm.geoFilters.serviceStation && str.match(/servicestation/g) && str.match(/servicestation/g).length > 0) {
                // $log.log("vm.geoFilters.serviceStation = " + vm.geoFilters.serviceStation);
                return true;
            }

            if (vm.geoFilters.competitorHub && str.match(/competitor/g) && str.match(/competitor/g).length > 0) {
                // $log.log("vm.geoFilters.competitorHub = " + vm.geoFilters.competitorHub);
                return true;
            }

            if (vm.geoFilters.cityLimits && str.match(/citylimit/g) && str.match(/citylimit/g).length > 0) {
                // $log.log("vm.geoFilters.cityLimits = ");
                // $log.log(vm.geoFilters.cityLimits);
                return true;
            }

            // if (filter.parkingLot && str.match(/parking/g) && str.match(/parking/g).length > 0)
            //     return true;
            // if (filter.serviceStation && str.match(/servicestation/g) && str.match(/servicestation/g).length > 0)
            //     return true;
            // if (filter.competitorHub && str.match(/competitor/g) && str.match(/competitor/g).length > 0)
            //     return true;
            //
            // return (filter.cityLimits && str.match(/citylimit/g) && str.match(/citylimit/g).length > 0);
            return false;
        }

        $scope.historyFenceInfoWindow = {
            show: true,
            control: {},
            options: {
                maxWidth: 300,
                disableAutoPan: false,
                pixelOffset: {
                    width: 0,
                    height: 0
                }
            }
        };


        $scope.historyPolygonEvents = {
            click: function (polygon, eventName, model, args) {
                //$log.log('polygon clicked');

                var polygonCenter = vm.getPolygonMidPoint(model.path);

                $scope.fenceObj = {
                    'latitude': polygonCenter.lat(),
                    'longitude': polygonCenter.lng()
                };

                $scope.fenceDetails = {
                    name: model.control.info.name,
                    other: model.control.info.tagdata
                };

                vm.historyFenceInfoWindowShow();
            }
        };

        $scope.historyCircleEvents = {
            click: function (circle, eventName, model, args) {
                //$log.log('history Circle clicked');

                $scope.fenceObj = {
                    'latitude': model.center.latitude,
                    'longitude': model.center.longitude
                };

                $scope.fenceDetails = {
                    name: model.control.info.name,
                    other: model.control.info.tagdata
                };

                vm.historyFenceInfoWindowShow();
            }
        };


        $scope.historyMapEvents = {
            click: function () {
                vm.historyFenceInfoWindowClose();
            }
        };


        vm.historyFenceInfoWindowClose = function () {
            //vm.infoWindow.control.hideWindow();
            $scope.historyFenceInfoWindow.show = false;
        };


        vm.mapClickEvent = function (evtType) {

        };

        vm.historyFenceInfoWindowShow = function () {
            $scope.historyFenceInfoWindow.show = true;
        };

        vm.getPolygonMidPoint = function (polygon) {
            var bound = new google.maps.LatLngBounds();
            for (var idx in polygon) {
                bound.extend(new google.maps.LatLng(polygon[idx].latitude, polygon[idx].longitude));
            }
            // $log.log(bound.getCenter().lat());
            // $log.log(bound.getCenter().lng());
            return bound.getCenter();
        };

        vm.addListener = function () {
            vehicleService.addListener('rtgps2', vm.updateMarker2);
            mapService.addListener('rtgps', vm.updateMarker);
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
            geofenceViewService.addListener('applyFilters', vm.applyFilters);
        };

        // Google Map Custom HTML Marker

        var firstLoad = true;
        var inGmap;
        vm.inCustomMaker = {};

        vm.customOverlay = function (marker) {
            if (!vm.inCustomMaker[marker.vehiclepath]) {
                if (firstLoad) {
                    $timeout(function () {
                        inGmap = vm.inMap.mapControl.getGMap();
                        vm.inCustomMaker[marker.vehiclepath] = new customMapOverlay.CustomMarker(marker.latitude, marker.longitude, inGmap, {marker: marker});
                        firstLoad = false;
                    }, 2000);
                } else {
                    vm.inCustomMaker[marker.vehiclepath] = new customMapOverlay.CustomMarker(marker.latitude, marker.longitude, inGmap, {marker: marker});
                }
            }
        };

        vm.showVehicleNumber = false;

        vm.showVehicleNumber = function (vn) {
            vm.vehicleNumber = vn;
            if (vm.vehicleNumber) {
                for (idx in vm.inCustomMaker) {
                    vm.inCustomMaker[idx].showVehicleNumber();
                }
            } else {
                for (idx in vm.inCustomMaker) {
                    vm.inCustomMaker[idx].hideVehicleNumber();
                }
            }
        };


        geofenceViewService.showVehicleNumber = function (vn) {
            vm.showVehicleNumber(vn);
        };


        vm.init = function () {
            vm.loadMap();
            // historyService.setData('inMarkers', vm.inMarkers);
            vm.addListener();
            geofenceViewService.getMyFences();
            $interval(vm.runStats, 3000);
        };

        vm.init();
    }

//#################################################################################################################


    function ImmobalizeController($scope, $log, $mdDialog, params, intellicarAPI, vehicleService) {
        //var vm = this;
        //$log.log('ImmobalizeController');

        $scope.msg = '';
        $scope.notify = '';
        $scope.commandSent = false;
        $scope.vehicleno = params.clickedMarker.vehicleno;
        $scope.deviceid = params.clickedMarker.deviceid;
        $scope.mobilityRequest = params.clickedMarker.mobilityRequest;


        $scope.cancelImmobalize = function () {
            $mdDialog.cancel();
        };


        $scope.success = function (resp) {
            // $log.log("success");
            // $log.log(resp);
            $scope.msg = params.clickedMarker.mobilityRequest ? 'Mobilize request sent' : 'Immobilize request sent';
            $scope.notify = '';

        };


        $scope.failure = function (resp) {
            //$log.log("failure");
            //$log.log(resp);
            $scope.msg = 'Request not sent';
            $scope.notify = '';
            if (resp.status == 403) {
                $scope.notify = 'You are not authorized to perform this operation';
            }
        };


        $scope.executeMobilityCommand = function (resp) {
            $log.log(resp);
            var vehiclepath = {'vehiclepath': params.clickedMarker.vehiclepath};

            if (resp.length > 0) {
                if (params.clickedMarker.mobilityRequest) {
                    $scope.mobilize(resp[0], vehiclepath);
                } else {
                    $scope.immobilize(resp[0], vehiclepath);
                }
            } else {
                if (params.clickedMarker.mobilityRequest) {
                    intellicarAPI.vehicleAPIService.mobilize(vehiclepath)
                        .then($scope.success, $scope.failure);
                    //$log.log("mobilize request sent");
                } else {
                    intellicarAPI.vehicleAPIService.immobilize(vehiclepath)
                        .then($scope.success, $scope.failure);
                    //$log.log("immobilize request sent");
                }
            }
        };


        $scope.immobilize = function (lastCommand, vehiclepath) {
            if (!params.clickedMarker.mobilistatus && lastCommand.action == 'immobilize') {
                $scope.msg = 'Request not sent';
                $scope.notify = "Vehicle already in immobilized state";
                return;
            }

            if (lastCommand.action == 'immobilize') {
                $scope.msg = 'Duplicate request!! Request not sent';
                $scope.notify = 'There is a pending immobilize request sent by ' +
                    lastCommand.username + ' at ' + new Date(lastCommand.doneat);
                //$log.log("immobilize request not sent");
            } else if (lastCommand.action == 'mobilize') {
                intellicarAPI.vehicleAPIService.immobilize(vehiclepath)
                    .then($scope.success, $scope.failure);
                //$log.log("immobilize request sent");
            }
        };


        $scope.mobilize = function (lastCommand, vehiclepath) {
            if (params.clickedMarker.mobilistatus && lastCommand.action == 'mobilize') {
                $scope.msg = 'Request not sent';
                $scope.notify = "Vehicle already in mobilized state";
                return;
            }

            if (lastCommand.action == 'mobilize') {
                $scope.msg = 'Duplicate request!! Request not sent';
                $scope.notify = 'There is a pending mobilize request sent by ' +
                    lastCommand.username + ' at ' + new Date(lastCommand.doneat);
                //$log.log("immobilize request not sent");
            } else if (lastCommand.action == 'immobilize') {
                intellicarAPI.vehicleAPIService.mobilize(vehiclepath)
                    .then($scope.success, $scope.failure);
                //$log.log("immobilize request sent");
            }
        };


        $scope.okImmobilize = function () {
            $scope.commandSent = true;
            if (vehicleService.vehiclesByPath[params.clickedMarker.vehiclepath].permissions.indexOf(74) == -1) {
                $scope.msg = 'Request not sent';
                $scope.notify = 'You are not authorized to perform this operation';
                return;
            }

            var data = {'vehiclepath': params.clickedMarker.vehiclepath};
            intellicarAPI.vehicleAPIService.getMobilityCommandStatus(data)
                .then($scope.executeMobilityCommand,
                    function (resp) {
                        $log.log("getMobilityCommandStatus failure");
                        $log.log(resp);
                    });
        };


        $scope.init = function () {
            $scope.commandSent = false;
            $scope.msg = params.clickedMarker.mobilityRequest ? "Mobilize ?" : "Immobilize ?";
        };


        $scope.init();
    }
})();
