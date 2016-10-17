(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('ImmobalizeController', ImmobalizeController);

    function MapController($scope, $log, mapService, $interval, geofenceViewService,vehicleService) {
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
        vm.clickedMarkerObj = vm.inMap.markers.clickedMarkerObj ;

        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.fenceInfoWindow  = vm.inMap.fenceInfoWindow;
        vm.doRebuildAll = false;
        vm.modelsbyref = false;

        vm.filterStr = '';
        vm.excludeFilters = ['icon', 'le', 'onroad', 'regno', 'team'];
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

            // $log.log(vehicleData);

            vm.inMarkers.push(vehicleData);
        };

        vm.updateMarker = function (vehicleData) {
            // //$log.log(vehicleData);
            // var isNewVehicle = true;
            // for (var idx in vm.inMarkers) {
            //     var marker = vm.inMarkers[idx];
            //     if (marker.id === vehicleData.id) {
            //         vm.inMarkers[idx] = vehicleData;
            //         isNewVehicle = false;
            //         break;
            //     }
            // }
            //
            // //$log.log(vehicleData);
            //
            // if (isNewVehicle) {
            //     //vehicleData.options = {};
            //     //vehicleData.options.animation = google.maps.Animation.BOUNCE;
            //     //$log.log(vehicleData);
            //
            //     vm.inMarkers.push(vehicleData);
            //     // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            // }

            //$log.log('updateMarker1');
            vm.applyFilterToMarker(vehicleData, vm.filterStr);

        }

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
                //$log.log(eachidx);
                // $log.log(marker);

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

                   // lowercaseMarkerStr = marker[eachidx].meta.toString().toLowerCase();
                    if (lowercaseMarkerStr.includes(lowercasefilterStr)){

                    }
                }


                if ( eachidx == 'meta' ){
                    for ( var myMeta in marker[eachidx]){
                        if (vm.excludeFilters.indexOf(eachidx) != -1)
                            continue;

                        var lowercasefilterStr = filterStr.toString().toLowerCase();
                        var lowercaseMarkerStr = marker[eachidx][myMeta].toString().toLowerCase();
                        //$log.log(lowercaseMarkerStr);

                        if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                            // if ((!marker.ignitionstatus && marker.options.visible)) {
                            //     $log.log(lowercasefilterStr + " = " + lowercaseMarkerStr);
                            // }
                            return true;
                        }
                        // $log.log(marker[eachidx]);
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
            noComm: false
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
                            // console.log(mapService.inMap.circles[idx]);
                            // console.log(idx);
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
            return bound.getCenter();
        };

        vm.addListener = function () {
            vehicleService.addListener('rtgps2', vm.updateMarker2);
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
        $interval(vm.runStats, 3000);
    }

//#################################################################################################################


    function ImmobalizeController($scope, $log, $mdDialog, params, intellicarAPI,
                                  $timeout) {
        //var vm = this;
        //$log.log('ImmobalizeController');

        $scope.msg = '';
        $scope.vehicleno = params.clickedMarker.vehicleno;
        $scope.deviceid = params.clickedMarker.deviceid;
        $scope.mobilistatus = params.clickedMarker.mobilistatus;


        $scope.cancelImmobalize = function () {
            $log.log('cancelImmobalize');
            $mdDialog.cancel();
        };


        $scope.success = function (resp) {
            // $log.log("success");
            // $log.log(resp);
            $scope.mobilistatus = params.clickedMarker.mobilistatus;
            if(params.clickedMarker.ignitionstatus) {
                $scope.msg = params.clickedMarker.mobilistatus ? "Vehicle immobilized" : "Vehicle mobilized";
            } else {
                var state = params.clickedMarker.mobilistatus ? "immobilized" : "mobilized";
                $scope.msg = 'Command received.';
                $scope.notify = 'Vehicle in sleep state. Vehicle will be ' + state + ' when it wakes up.';
            }
            //$scope.closeMainDialog();
        };


        $scope.failure = function (resp) {
            //$log.log("failure");
            //$log.log(resp);
            if (resp.status == 403) {
                $scope.msg = "You are not authorized to perform this operation";
            }
            //$scope.closeMainDialog();
        };

        // $scope.closeMainDialog = function () {
        //     //$timeout($mdDialog.cancel, 3000);
        //     $mdDialog.cancel();
        // };


        $scope.okImmobilize = function () {
            $scope.commandSent = true;
            var data = {'vehiclepath': params.clickedMarker.vehiclepath};
            if (params.clickedMarker.mobilistatus) {
                intellicarAPI.vehicleAPIService.immobilize(data)
                    .then($scope.success, $scope.failure);
            } else {
                intellicarAPI.vehicleAPIService.mobilize(data)
                    .then($scope.success, $scope.failure);
            }
        };


        $scope.init = function () {
            $scope.commandSent = false;
            $scope.msg = params.clickedMarker.mobilistatus ? "Immobilize ?" : "Mobilize ?";
        };


        $scope.init();
    }


//#################################################################################################################

})();
