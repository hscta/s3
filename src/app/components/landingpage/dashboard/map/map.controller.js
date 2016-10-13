(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('ImmobalizeController', ImmobalizeController)
        .controller('InnerMapController', InnerMapController);

    function MapController($scope, $log, mapService,
                           $mdDialog, $interval, geofenceViewService,
                           historyService, dialogService) {
        $log.log('MapController');
        var vm = this;
        // vm.circles = [];
        // vm.polygons = [];

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
        // vm.inMarkers = mapService.getMainMarkers();
        vm.inMarkers = vm.inMap.markers.inMarkers;
        vm.clickedMarker = vm.inMap.markers.clickedMarker;
        vm.clickedMarkerObj = vm.inMap.markers.clickedMarkerObj ;

        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.fenceInfoWindow  = vm.inMap.fenceInfoWindow;
        vm.doRebuildAll = false;
        vm.modelsbyref = false;

        vm.filterStr = '';
        vm.excludeFilters = ['icon'];
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

        vm.alertClick = function (alertid) {
            for (var idx in vm.inMarkers) {
                if (vm.inMarkers[idx].id == alertid) {
                    vm.clickedMarker = vm.inMarkers[idx];
                    break;
                }
            }
            //$log.log(vm.clickedMarker);

            vm.clickedMarkerObj = {
                clickedMarker: vm.clickedMarker,
                immoblize: vm.immobalize,
                showHistory: vm.showHistory
            };

            vm.infoWindowShow();
            vm.inMap.center = vm.getMarkerCenter(vm.clickedMarker);
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


        vm.updateMarker = function (vehicleData) {
            //$log.log(vehicleData);
            var isNewVehicle = true;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id === vehicleData.id) {
                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                    break;
                }
            }

            //$log.log(vehicleData);

            if (isNewVehicle) {
                //vehicleData.options = {};
                //vehicleData.options.animation = google.maps.Animation.BOUNCE;
                //$log.log(vehicleData);

                vm.inMarkers.push(vehicleData);
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }

            vm.applyFilterToMarker(vehicleData, vm.filterStr);
        };


        vm.runFilters = function (filterStr) {
            //$log.log("runFilters");

            if (vm.filterStr !== filterStr)
                vm.infoWindowClose();

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

            } else {
                marker.options.visible = true;
            }

            marker.options.visible = vm.checkRoaded(marker) && marker.options.visible;

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

        $interval(vm.runStats, 3000);

        vm.cancelImmobalize = function () {
            $mdDialog.cancel();
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
            $log.log(fences);
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
                    $log.log(vm.inMap.circles);
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
                            console.log(mapService.inMap.polygons[idx].visible);

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


        vm.mapClickEvent = function(evtType){

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
            mapService.addListener('rtgps', vm.updateMarker);
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
            geofenceViewService.addListener('applyFilters', vm.applyFilters);
        };

        vm.init = function () {
            vm.loadMap();
            // historyService.setData('inMarkers', vm.inMarkers);
            vm.addListener();
            geofenceViewService.getMyFences();
        };

        vm.init();
    }

//#################################################################################################################


    function ImmobalizeController($scope, $log, $mdDialog, params) {
        //var vm = this;
        //$log.log('ImmobalizeController');
        $scope.cancelImmobalize = function () {
            $log.log('cancelImmobalize');
            $mdDialog.cancel();
        };

        $scope.okImmobilize = function () {
            $log.log('okImmobilize');
            $mdDialog.cancel();
        };

        $scope.vehicleno = params.clickedMarker.vehicleno;
        $scope.deviceid = params.clickedMarker.deviceid;
    }


//#################################################################################################################


    function InnerMapController($scope, $log, $mdToast, historyService, $interval) {
        $log.log('InnerMapController');
        var marker = historyService.getData('clickedMarker');
        var historyMap = historyService.getData('historyMap');
        var timeIncreaseBy = 120000;
        var initialTime;
        var tracePoint;
        var animationCount = 0;

        $scope.play = true;
        $scope.ffrate = 1;

        $scope.moveOneStep = function (movementType) {
            if (!marker.trace.path.length)
                return;


            var path = marker.trace.path;

            if (movementType == 'forward') {
                animationCount++;
                if (path.length - 1 < animationCount)
                    animationCount = path.length - 1;

            } else {
                animationCount--;
                if (animationCount <= 0)
                    animationCount = 0;
            }

            $scope.slider = (path[animationCount].gpstime - path[0].gpstime) / 1000
            updateTracePoint(path[animationCount]);

            initialTime = path[animationCount].gpstime;
        };

        $scope.setSliderTime = function () {
            if (marker && !marker.trace.path.length)
                return;

            $scope.initialSliderTime = 0;
            $scope.finalSliderTime = (marker.trace.path[marker.trace.path.length - 1].gpstime -
                marker.trace.path[0].gpstime ) / 1000;

            // $log.log(marker.trace.path[marker.trace.path.length - 1].gpstime);
            // $log.log("slider time = " + $scope.finalSliderTime);

        };

        $scope.getSliderTime = function () {
            if (marker && marker.trace.path.length) {
                return new Date(marker.trace.path[0].gpstime + Math.floor($scope.slider) * 1000);
            }
        };


        $scope.onChangeSlider = function () {
            if (marker && !marker.trace.path.length)
                return;

            $scope.sliderTime = $scope.getSliderTime();
            // $log.log("jump slider to " + $scope.sliderTime);

            $scope.slider = Math.floor($scope.slider);

            var len = marker.trace.path.length;
            var path = marker.trace.path;
            var initialSliderTime = path[0].gpstime;
            var clickedSliderTimeLimit = initialSliderTime + $scope.slider * 1000;

            for (var idx = 0; idx < len; idx++) {
                if (path[idx].gpstime > clickedSliderTimeLimit)
                    break;
            }

            animationCount = idx - 1;
            initialTime = path[animationCount].gpstime;
            updateTracePoint(path[animationCount]);
        };

        var updateTracePoint = function (tracePoint) {
            marker.latitude = tracePoint.latitude;
            marker.longitude = tracePoint.longitude;

            $scope.tracePointGpsTime = tracePoint.gpstime;
            $scope.tracePointOdometer = tracePoint.odometer;
            $scope.tracePointSpeed = tracePoint.speed;
        };

        $scope.traceRoute = function () {
            if (marker.trace.path.length && $scope.gotHistory()) {
                initialTime = marker.trace.path[animationCount].gpstime;
                $scope.animateMarker = $interval(function () {
                    initialTime += (timeIncreaseBy * $scope.ffrate);
                    while (animationCount < marker.trace.path.length) {
                        // $log.log('in loop ' + animationCount);
                        tracePoint = marker.trace.path[animationCount];
                        if (tracePoint.gpstime <= initialTime) {

                            updateTracePoint(tracePoint);

                            $scope.slider = (tracePoint.gpstime - marker.trace.path[0].gpstime) / 1000;
                            $scope.sliderTime = $scope.getSliderTime();

                            if (animationCount % 10 === 0) {
                                moveMapWithMarker(marker);
                            }
                            animationCount++;
                        } else {
                            break;
                        }
                    }

                    if (animationCount >= marker.trace.path.length || !$scope.gotHistory()) {
                        $scope.stopAnimation();
                        moveMapWithMarker(marker);
                    }

                }, 100);
            }
        };


        $scope.fastForward = function () {
            if ($scope.ffrate < 128) {
                $scope.ffrate *= 2;
            }
        };


        $scope.goSlow = function () {
            if ($scope.ffrate > (1 / 128)) {
                $scope.ffrate /= 2;
            }
        };


        $scope.getAnimationRate = function () {
            var animationRate = Math.floor((timeIncreaseBy / 1000) * $scope.ffrate);
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Playing ' + animationRate + ' secs in 1 sec')
                    .position(100, 100)
                    .hideDelay(3000)
            );
        };


        $scope.stopAnimation = function () {
            animationCount = 0;
            $scope.ffrate = 1;
            stopPlay();
            $scope.slider = 0;
            if (marker && marker.trace.path.length > 0) {
                marker.latitude = marker.trace.path[animationCount].latitude;
                marker.longitude = marker.trace.path[animationCount].longitude;
            }
        };

        var stopPlay = function () {
            $interval.cancel($scope.animateMarker);
            $scope.play = true;
        };


        $scope.$on('$destroy', function () {
            historyService.setData('getHistory', false);
            $scope.stopAnimation();
        });


        $scope.playAnimation = function () {
            //$log.log('playAnimation');
            $scope.play = false;
            $scope.traceRoute();
        };


        $scope.pauseAnimation = function () {
            //$log.log('pauseAnimation');
            $scope.play = true;
            $scope.pauseInterval();
        };

        $scope.pauseInterval = function () {
            $interval.cancel($scope.animateMarker);
            $scope.animateMarker = undefined;
        };

        $scope.gotHistory = function () {
            return historyService.getData('getHistory');
        };


        $scope.gotHistoryEvent = function () {
            $scope.setSliderTime();
            var initialPoint = marker.trace.path[0];
            $scope.tracePointGpsTime = initialPoint.gpstime;
            $scope.tracePointOdometer = initialPoint.odometer;
            $scope.tracePointSpeed = initialPoint.speed;
        };

        $scope.$on('gotHistoryEvent', function (event, data) {
            $scope.gotHistoryEvent();
        });


        var moveMapWithMarker = function (marker) {
            var map = historyMap.mapControl.getGMap();
            var projection = map.getProjection();

            var centerPoint = projection.fromLatLngToPoint(map.getCenter());
            var scale = Math.pow(2, map.getZoom());

            var worldPoint = projection.fromLatLngToPoint(new google.maps.LatLng({
                lat: marker.latitude,
                lng: marker.longitude
            }));
            var xdiff = Math.abs((worldPoint.x - centerPoint.x) * scale);

            var ydiff = Math.abs((worldPoint.y - centerPoint.y) * scale);
            var panX = Math.floor((worldPoint.x - centerPoint.x) * scale);

            var panY = Math.floor((worldPoint.y - centerPoint.y) * scale);
            if (xdiff > 500 || ydiff > 200) {
                map.panBy(panX, panY);
            }
        };
    }

})();
