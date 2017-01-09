(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('ImmobalizeController', ImmobalizeController);


    function MapController($scope, $log, cpuService, mapService,
                           $interval, geofenceViewService, $timeout, customMapOverlay, $compile,
                           vehicleService, historyService, $state, $mdDialog, intellicarAPI) {
        $log.log('MapController');
        var vm = this;
        var dateFormat = 'DD-MM-YYYY HH:mm';

        var wh = $(window).height();
        var header_height = 95;

        var markerInfowindow = new google.maps.InfoWindow();
        var fenceInfowindow = new google.maps.InfoWindow();


        vm.inMap = mapService.getMainMap();
        vm.inMarkers = vm.inMap.markers.inMarkers;
        vm.markersByPath = vm.inMap.markers.markersByPath;
        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.filterStr = mapService.filterStr;
        vm.excludeFilters = [
            'icon', 'le', 'onroad', 'regno',
            'carbattery', 'devbattery', 'odometer',
            'latitude', 'longitude', 'altitude', 'direction', 'nosatellites',
            'speed', 'rpm'
        ];
        vm.mainFilters = ['Running', 'Stopped', 'Active', 'Immobilized', 'Not Communicating', 'Device pullout'];
        vm.markerIconChangeTriggered = false;
        vm.zoomhappened = true;

        vm.onRoaded = true;
        vm.offRoaded = false;

        vm.leftToolbar = function () {
            return geofenceViewService.getToolbarVar();
        };


        vm.loadMap = function () {
            vm.inMap.zoom = mapService.getZoom();
            vm.inMap.center = mapService.getCenter();
            vm.inMap.bounds = mapService.getBounds();
            vm.createMap();
        };


        vm.setUserPref = function (userSettings) {
            //vm.inMap.center = userSettings.station;
            vm.inMap.map.setCenter(new google.maps.LatLng(userSettings.station.latitude, userSettings.station.longitude));
        };


        vm.getMarkerCenter = function (marker) {
            return {latitude: marker.latitude, longitude: marker.longitude};
        };

        vm.onRoadCheck = function () {
            // $log.log("onroad check");
            vm.runFilters(vm.filterStr);
            vm.runStats();
        };


        vm.offRoadCheck = function () {
            //$log.log("offroad check");
            vm.runFilters(vm.filterStr);
            vm.runStats();
        };


        vm.checkRoaded = function (rtgps) {
            if (rtgps && rtgps.meta) {
                if (rtgps.meta.onroad) {
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


        vm.setClickedMarker = function (model) {
            if (model.vehiclepath in vm.markersByPath) {
                //delete model['marker'];
                // console.log(model.vehiclepath);
                vm.inMap.markers.clickedMarker = vehicleService.vehiclesByPath[model.vehiclepath];
                vm.inMap.markers.clickedMarker.hideMobilityControls = (vehicleService.vehiclesByPath[model.vehiclepath].permissions.indexOf(74) == -1);
                $scope.clickedMarker = vm.inMap.markers.clickedMarker;
                $scope.hideMobilityControls = vm.inMap.markers.clickedMarker.hideMobilityControls;
            }
        };


        vm.updateMarker2 = function (rtgps) {
            // $log.log('updateMarker2');
            // $log.log(rtgps);

            //vm.inMarkers.push(rtgps);


            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(rtgps.latitude, rtgps.longitude),
                icon: vm.getIcon(rtgps),
                vehiclepath: rtgps.vehiclepath
            });

            // var data = rtgps.vehiclepath;

            if (!(rtgps.vehiclepath in vm.markersByPath)) {
                vm.markersByPath[rtgps.vehiclepath] = marker;
            }

            google.maps.event.addListener(marker, 'click', function (event) {
                vm.setClickedMarker(this);
                markerInfowindow.setContent(document.getElementById("marker_infowindow").innerHTML);

                markerInfowindow.open(map, this);
            });

            marker.setMap(vm.inMap.map);
            vm.customOverlay(rtgps);
        };


        vm.updateMarker = function (rtgps) {
            if ((rtgps.vehiclepath in vm.inCustomMaker) && (vm.geoFilters.showVehicleNo)) {
                vm.inCustomMaker[rtgps.vehiclepath].setPosition(rtgps);
            }

            if (rtgps.vehiclepath in vm.markersByPath) {
                var markerPos = new google.maps.LatLng(rtgps.latitude, rtgps.longitude);
                vm.markersByPath[rtgps.vehiclepath].setPosition(markerPos);
                vm.updateMarkerIcon(rtgps);
            }

            vm.applyFilterToMarker(rtgps, vm.filterStr);
        };


        vm.showAllMarkers = function () {
            for (var idx in vm.markersByPath) {
                var rtgps = vehicleService.vehiclesByPath[idx].rtgps;
                vm.markersByPath[idx].setVisible(vm.checkRoaded(rtgps) && true);
            }
        };

        vm.runFilters = function (filterStr) {
            vm.filterStr = filterStr;
            mapService.filterStr = filterStr;
            markerInfowindow.close();

            if (vm.filterStr.length == 0) {
                vm.showAllMarkers();
                //vm.inMap.map.setZoom(11);
                return;
            }

            console.log("filter=", vm.filterStr);

            /* center the map based on the first marker position that matches the filter */
            var centerMap = false;
            var centerLatLng = null;
            var fenceMatch = false;
            var matchedMarker = null;

            if (vm.filterStr.length > 2) {
                for (var idx in vm.markersByPath) {
                    var visible = vm.applyFilterToMarker(vehicleService.vehiclesByPath[idx].rtgps, filterStr);
                    if (visible) {
                        matchedMarker = vm.markersByPath[idx];
                        var lat = Math.floor(matchedMarker.getPosition().lat());
                        var lng = Math.floor(matchedMarker.getPosition().lng());
                        var maplat = Math.floor(vm.inMap.map.getCenter().lat());
                        var maplng = Math.floor(vm.inMap.map.getCenter().lng());

                        if (lat == maplat && lng == maplng && !centerMap) {
                            if (Math.abs(matchedMarker.getPosition().lat() - vm.inMap.map.getCenter().lat()) > 0.2) {
                                vm.inMap.map.setCenter(matchedMarker.getPosition());
                            }

                            if (vm.mainFilters.indexOf(vm.filterStr) == -1) {
                                vm.inMap.map.setCenter(matchedMarker.getPosition());
                                vm.inMap.map.setZoom(16);
                            }

                            centerMap = true;
                        }
                        centerLatLng = matchedMarker.getPosition();
                    }
                }

                for (var idx in vm.polygonsByPath) {
                    if (centerMap)
                        break;

                    var fencePolygon = vm.polygonsByPath[idx];
                    if (fencePolygon.control.info.tagdata.olafilter == 'citylimit')
                        continue;
                    if (!fencePolygon.control.info.name.toString().toLowerCase().includes(filterStr.toString().toLowerCase()))
                        continue;

                    fenceMatch = true;
                    for (var item in fencePolygon.path) {
                        var latlng = fencePolygon.path[item];
                        centerLatLng = new google.maps.LatLng(latlng.latitude, latlng.longitude);
                        if (Math.abs(latlng.latitude - vm.inMap.map.getCenter().lat()) < 0.5 &&
                            Math.abs(latlng.longitude - vm.inMap.map.getCenter().lng()) < 0.5) {
                            //console.log("Centering map at ", fencePolygon.control.info.name);
                            vm.inMap.map.setCenter(centerLatLng);
                            vm.inMap.map.setZoom(16);
                            centerMap = true;
                            break;
                        }
                    }
                }


                for (var idx in vm.circlesByPath) {
                    if (centerMap)
                        break;

                    var fenceCircle = vm.circlesByPath[idx];
                    if (fenceCircle.control.info.tagdata.olafilter == 'citylimit')
                        continue;
                    if (!fenceCircle.control.info.name.toString().toLowerCase().includes(filterStr.toString().toLowerCase()))
                        continue;

                    fenceMatch = true;
                    var latlng = fenceCircle.center;
                    centerLatLng = new google.maps.LatLng(latlng.latitude, latlng.longitude);
                    if (Math.abs(latlng.latitude - vm.inMap.map.getCenter().lat()) < 0.5 &&
                        Math.abs(latlng.longitude - vm.inMap.map.getCenter().lng()) < 0.5) {
                        //console.log("Centering map at ", fenceCircle.control.info.name);
                        vm.inMap.map.setCenter(centerLatLng);
                        vm.inMap.map.setZoom(16);
                        centerMap = true;
                        break;
                    }
                }

                if(fenceMatch) {
                    vm.showAllMarkers();
                }

                if (centerLatLng && !centerMap) {
                    vm.inMap.map.setCenter(centerLatLng);
                    if (vm.mainFilters.indexOf(vm.filterStr) == -1)
                        vm.inMap.map.setZoom(16);
                }
            }

            if (vm.vehicleNumber) {
                showVehicleNumberWindow();
            }
        };

        vm.applyFilterToMarker = function (rtgps, filterStr) {
            if (rtgps == null)
                return false;

            if (!(rtgps.vehiclepath in vm.markersByPath)) {
                // console.log(rtgps.vehiclepath);
                return false;
            }

            var visible = false;
            if (!vm.matchesAnyMarkerData(rtgps, filterStr)) {
                visible = false;
                if (rtgps.vehiclepath in vm.inCustomMaker) {
                    vm.inCustomMaker[rtgps.vehiclepath].hide();
                }
            } else {
                visible = true;
                if (rtgps.vehiclepath in vm.inCustomMaker && vm.geoFilters.showVehicleNo) {
                    vm.inCustomMaker[rtgps.vehiclepath].show();
                }
            }

            visible = vm.checkRoaded(rtgps) && visible;
            vm.markersByPath[rtgps.vehiclepath].setVisible(visible);

            if (rtgps.vehiclepath in vm.inCustomMaker) {
                if (visible && vm.geoFilters.showVehicleNo) {
                    vm.inCustomMaker[rtgps.vehiclepath].show();
                } else {
                    vm.inCustomMaker[rtgps.vehiclepath].hide();
                }
            }
            return visible;
        };


        vm.matchesAnyMarkerData = function (input, filterStr) {
            var result = false;

            if (input.constructor == Object || input.constructor == Array) {
                for (var eachidx in input) {

                    if (input[eachidx] == null)
                        continue;

                    result = result || vm.matchesAnyMarkerData(input[eachidx], filterStr);
                }

                return result;
            }

            if (vm.excludeFilters.indexOf(input) != -1)
                return false;

            var lowercasefilterStr = filterStr.toString().toLowerCase();
            var lowercaseMarkerStr = input.toString().toLowerCase();

            if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                return true;
            }

            return false;
        };


        vm.vehicleStats = {
            showall: 0,
            running: 0,
            stopped: 0,
            active: 0,
            noComm: 0,
            devPullout: 0,
            immobilized: 0
        };


        vm.runStats = function () {
            for (var filter in vm.vehicleStats) {
                if (filter === 'showall') { // <---- Why we put condition ?
                    vm.vehicleStats[filter] = vm.getStats(filter);
                } else {
                    vm.vehicleStats[filter] = vm.getStats(filter);
                }
            }
        };


        vm.getStats = function (filterStr) {
            var count = 0;
            vm.vehicleStats.noComm = 0;
            vm.vehicleStats.devPullout = 0;
            for (var idx in vehicleService.vehiclesByPath) {
                var rtgps = vehicleService.vehiclesByPath[idx].rtgps;
                if (vm.checkRoaded(rtgps)) {
                    checkNoComm(rtgps, function (rtgps) {
                        vm.vehicleStats.noComm++;
                    });
                    if (rtgps.carbattery < 2) {
                        vm.vehicleStats.devPullout++;
                    }
                    if (vm.matchesAnyMarkerData(rtgps, filterStr)) {
                        count++;
                    } else { // <--- Can we use else if instead of this ?
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
            tollplaza: true,
            cityLimits: false,
            carBattery: false,
            devBattery: false,
            noComm: false,
            showVehicleNo: false
        };

        geofenceViewService.setData('geoFilters', vm.geoFilters);

        var PARKING = 'parking';
        var SERVICE_STATION = 'servicestation';
        var COMPETITOR_HUB = 'competitor';
        var CITY_LIMIT = 'citylimit';
        var TOLL_PLAZA = 'tollplaza';

        var DEFAULT_STROKE = 6;
        var MIN_STROKE = 3;


        vm.getMyFences = function (fences) {
            geofenceViewService.setData('geofences', true);
            vm.applyFilters({filterType: 'showAll'});

            vm.createPolygons(fences.polygons);
            vm.createCircles(fences.circles);
        };

        vm.createPolygons = function (polygons) {
            var polygonMap = {};
            for (var idx in polygons) {
                var paths = [];
                for (var j = 0; j < polygons[idx].path.length; j++) {
                    paths.push(new google.maps.LatLng(polygons[idx].path[j].latitude,
                        polygons[idx].path[j].longitude));
                }

                var color = getColor(polygons[idx].control.info.tagdata);
                polygons[idx].strokeColor = color;

                var strokeWeight = getStroke(polygons[idx].control.info.tagdata);
                polygons[idx].strokeWeight = strokeWeight;

                var googlePolygon = new google.maps.Polygon({
                    path: paths,
                    strokeColor: polygons[idx].strokeColor,
                    strokeWeight: polygons[idx].strokeWeight,
                    fillColor: polygons[idx].fillColor,
                    fillOpacity: polygons[idx].fillOpacity,
                    info: polygons[idx].control.info
                });

                google.maps.event.addListener(googlePolygon, 'click', function (evt) {
                    vm.selectedFenceObj = this;
                    fenceInfowindow.setContent(document.getElementById("fence_infowindow").innerHTML);
                    fenceInfowindow.setPosition(evt.latLng);
                    fenceInfowindow.open(vm.inMap.map, this);
                });

                if (checkFilterString(polygons[idx].control.info.tagdata)) {
                    googlePolygon.setMap(vm.inMap.map);
                }

                polygons[idx].googleObject = googlePolygon;
                polygonMap[polygons[idx].control.info.assetpath] = polygons[idx];
            }
            vm.polygonsByPath = polygonMap;
        };


        vm.createCircles = function (circles) {
            var circlesMap = {};
            for (var idx in circles) {

                var color = getColor(circles[idx].control.info.tagdata);
                circles[idx].strokeColor = color;

                var strokeWeight = getStroke(circles[idx].control.info.tagdata);
                circles[idx].strokeWeight = strokeWeight;

                var googleCircle = new google.maps.Circle({
                    strokeColor: circles[idx].strokeColor,
                    strokeWeight: circles[idx].strokeWeight,
                    fillColor: circles[idx].fillColor,
                    fillOpacity: circles[idx].fillOpacity,
                    center: new google.maps.LatLng(circles[idx].center.latitude, circles[idx].center.longitude),
                    radius: circles[idx].radius,
                    info: circles[idx].control.info
                });

                google.maps.event.addListener(googleCircle, 'click', function (evt) {
                    vm.selectedFenceObj = this;
                    fenceInfowindow.setPosition(evt.latLng);
                    fenceInfowindow.setContent(document.getElementById("fence_infowindow").innerHTML);
                    fenceInfowindow.open(vm.inMap.map, this);
                });

                if (checkFilterString(circles[idx].control.info.tagdata)) {
                    googleCircle.setMap(vm.inMap.map);
                }

                circles[idx].googleObject = googleCircle;
                circlesMap[circles[idx].control.info.assetpath] = circles[idx];

            }
            vm.circlesByPath = circlesMap;
        };


        var DEVBATTERY_THRESHOLD = 3.55;
        var CARBATTERY_THRESHOLD = 9.5;

        vm.applyFilters = function (filterData, recall) {
            var idx;
            var marker;
            if (recall == null) {
                recall = 1;
            }

            if (filterData.filterType == 'carBattery') {
                for (idx in vm.markersByPath) {
                    marker = vm.markersByPath[idx];
                    if (vm.geoFilters.carBattery) {
                        if (vehicleService.vehiclesByPath[idx].rtgps.carbattery < CARBATTERY_THRESHOLD &&
                            vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {
                            vm.inCustomMaker[marker.vehiclepath].highlight('orange');
                        }
                    } else {
                        if (recall == 1) {
                            vm.inCustomMaker[marker.vehiclepath].unhighlight();
                            vm.applyFilters({filterType: 'devBattery'}, recall - 1);
                            vm.applyFilters({filterType: 'noComm'}, recall - 1);
                        }
                    }
                }
            } else if (filterData.filterType == 'devBattery') {
                for (idx in vm.markersByPath) {
                    marker = vm.markersByPath[idx];
                    if (vm.geoFilters.devBattery) {
                        if (vehicleService.vehiclesByPath[idx].rtgps.devbattery < DEVBATTERY_THRESHOLD &&
                            vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {
                            vm.inCustomMaker[marker.vehiclepath].highlight('yellow');
                        }
                    } else {
                        if (recall == 1) {
                            vm.inCustomMaker[marker.vehiclepath].unhighlight();
                            vm.applyFilters({filterType: 'carBattery'}, recall - 1);
                            vm.applyFilters({filterType: 'noComm'}, recall - 1);
                        }

                    }
                }
            } else if (filterData.filterType == 'noComm') {
                for (idx in vm.markersByPath) {
                    marker = vm.markersByPath[idx];
                    if (vm.geoFilters.noComm) {
                        checkNoComm(vehicleService.vehiclesByPath[idx].rtgps, function () {
                            if (vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {
                                vm.inCustomMaker[marker.vehiclepath].highlight('red');

                            }
                        });
                    }
                    else {
                        if (recall == 1) {
                            vm.inCustomMaker[marker.vehiclepath].unhighlight();
                            vm.applyFilters({filterType: 'devBattery'}, recall - 1);
                            vm.applyFilters({filterType: 'carBattery'}, recall - 1);
                        }
                    }
                }
            } else if (filterData.filterType == 'showVehicleNo') {
                // Do something to notify showVehicleNo filter is On
            } else {
                if ($state.current.name == 'home.history')
                    vm.currentMap = historyService.historyMap.map;
                else
                    vm.currentMap = vm.inMap.map;

                if (vm.circlesByPath) {
                    // $log.log(vm.circlesByPath);
                    for (var idx in vm.circlesByPath) {
                        var filterStr = vm.circlesByPath[idx].control.info.tagdata;
                        vm.circlesByPath[idx].googleObject.setMap(null);

                        if (checkFilterString(filterStr)) {
                            vm.circlesByPath[idx].strokeWeight = getStroke(filterStr);
                            vm.circlesByPath[idx].strokeColor = getColor(filterStr);
                            vm.circlesByPath[idx].googleObject.setMap(vm.currentMap);
                            //startAnimation(vm.circlesByPath[idx]);
                        }
                    }
                }
                if (vm.polygonsByPath) {
                    for (var idx in vm.polygonsByPath) {
                        filterStr = vm.polygonsByPath[idx].control.info.tagdata;
                        vm.polygonsByPath[idx].googleObject.setMap(null);
                        if (checkFilterString(filterStr)) {
                            vm.polygonsByPath[idx].googleObject.setMap(vm.currentMap);
                            //startAnimation(vm.polygonsByPath[idx]);
                        }
                    }
                }
            }
        };


        function checkNoComm(marker, callback) {
            var currentTime = new Date().getTime();
            var lastSeenAt = marker.timestamp.getTime();
            var noCommThreshold = vehicleService.noCommThreshold;
            if (currentTime - lastSeenAt > noCommThreshold) {
                if (callback) {
                    callback(marker);
                }
            }
        }


        function getColor(str) {
            var type = getType(str);

            if (type == PARKING) {
                return 'black';
            } else if (type == SERVICE_STATION) {
                return '#bc31ff';
            } else if (type == COMPETITOR_HUB) {
                return 'red';
            } else if (type == CITY_LIMIT) {
                return 'blue';
            } else if (type == TOLL_PLAZA) {
                return '#f37813';
            }

            return '#31ff36';
        }

        function getStroke(str) {
            var type = getType(str);
            if (type == CITY_LIMIT) {
                return MIN_STROKE;
            }

            return DEFAULT_STROKE;
        }


        function startAnimation(obj) {
            var count = 0;
            //$log.log(getType(obj.control.info.tagdata));
            if (getType(obj.control.info.tagdata) !== CITY_LIMIT) {
                $interval(function () {
                    count++;
                    if (count % 2 == 0)
                        obj.strokeWeight = DEFAULT_STROKE;
                    else
                        obj.strokeWeight = MIN_STROKE;

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
            if (str.match(/tollplaza/g) && str.match(/tollplaza/g).length > 0)
                return TOLL_PLAZA;

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

            if (vm.geoFilters.competitorHub && str.match(/tollplaza/g) && str.match(/tollplaza/g).length > 0) {
                // $log.log("vm.geoFilters.tollplaza = " + vm.geoFilters.tollplaza);
                return true;
            }

            if (vm.geoFilters.cityLimits && str.match(/citylimit/g) && str.match(/citylimit/g).length > 0) {
                // $log.log(vm.geoFilters.cityLimits);
                return true;
            }

            return false;
        }

        vm.addListener = function () {
            vehicleService.addListener('rtgps2', vm.updateMarker2);
            mapService.addListener('rtgps', vm.updateMarker);
            geofenceViewService.addListener('getMyFences', vm.getMyFences);
            geofenceViewService.addListener('applyFilters', vm.applyFilters);
            mapService.addListener('setUserPref', vm.setUserPref);
        };

        // Google Map Custom HTML Marker ================================================================================================================

        vm.inCustomMaker = {};

        mapService.highlightMarker = function (vehiclePath) {
            vm.highlightMarker(vehiclePath);
        };

        vm.highlightMarker = function (vehiclePath) {
            if (vehiclePath in vm.inCustomMaker) {
                vm.inCustomMaker[vehiclePath].highlightMe();
            } else {
                console.log('[CUSTOM OVERLAY] no marker found to highLight!');
            }
        };


        vm.customOverlay = function (rtgps) {
            if (!(rtgps.vehiclepath in vm.inCustomMaker)) {
                vm.inCustomMaker[rtgps.vehiclepath] = new customMapOverlay.CustomMarker(rtgps.latitude, rtgps.longitude, mapService.inMap.map, {marker: rtgps});
            }
        };

        function showVehicleNumberWindow() {
            for (idx in vm.inCustomMaker) {
                if (vm.markersByPath[vm.inCustomMaker[idx].args.marker.vehiclepath].getVisible()) {
                    vm.inCustomMaker[idx].show();
                    vm.inCustomMaker[idx].showVehicleNumber();
                } else {
                    vm.inCustomMaker[idx].hide();
                    vm.inCustomMaker[idx].hideVehicleNumber();
                }
            }
        }

        vm.showVehicleNumber = function (vn) {
            //vm.runFilters(vm.filterStr);
            vm.vehicleNumber = vn;
            if (vm.vehicleNumber) {
                showVehicleNumberWindow();
            } else {
                for (idx in vm.inCustomMaker) {
                    vm.inCustomMaker[idx].hide();
                    vm.inCustomMaker[idx].hideVehicleNumber();
                }
            }
        };


        geofenceViewService.showVehicleNumber = function (vn) {
            vm.showVehicleNumber(vn);
        };


        vm.downloadView = function (event, active) {
            var selectedView = [];
            var latlngList = [];
            var UNKNOWN = "UNKNOWN";
            for (var idx in vm.inMap.markers.markersByPath) {
                var marker = vm.inMap.markers.markersByPath[idx];
                if (marker.getVisible()) {
                    var rtgps = vehicleService.vehiclesByPath[idx].rtgps;

                    selectedView.push({
                        "Vehicle No": rtgps.vehicleno,
                        "Device ID": rtgps.deviceid,
                        "Chassis No": rtgps.meta.chassisno,
                        "Make": rtgps.meta.cartype,
                        "Last comm time": moment(rtgps.timestamp).format(dateFormat),
                        "Odometer": rtgps.odometer,
                        "OnRoad": rtgps.meta.onroad,
                        "Mobility": rtgps.mobilistatusFilter,
                        "Ignition": rtgps.ignitionstatusStr,
                        "Vehicle Battery": rtgps.carbattery,
                        "Device Battery": rtgps.devbattery,
                        //"City": rtgps.meta.city,
                        "Team": rtgps.meta.team,
                        "Leasing Executive": rtgps.meta.le,
                        "Last Location": UNKNOWN,
                        "LatLng": rtgps.latitude + "," + rtgps.longitude
                    });

                    latlngList.push([rtgps.latitude, rtgps.longitude]);
                }
            }

            intellicarAPI.geocodeService.getAddress(latlngList)
                .then(function (resp) {
                    for (var idx in resp) {
                        selectedView[idx]["Last Location"] = resp[idx][1];
                    }
                    intellicarAPI.importFileservice.JSONToCSVConvertor(selectedView, "ViewReport", true);
                }, function (resp) {
                    intellicarAPI.importFileservice.JSONToCSVConvertor(selectedView, "ViewReport", true);
                });
        };


        vm.createMap = function () {
            var mapCanvas = document.getElementById("map");
            vm.inMap.mapOptions = {
                center: new google.maps.LatLng(vm.inMap.center.latitude, vm.inMap.center.longitude),
                zoom: vm.inMap.zoom
            };
            vm.inMap.map = new google.maps.Map(mapCanvas, vm.inMap.mapOptions);

            vm.inMap.map.addListener('click', function () {
                markerInfowindow.close();
                fenceInfowindow.close();
            });

            var searchBox = new google.maps.places.SearchBox(document.getElementById('pac-input'));

            vm.inMap.map.controls[google.maps.ControlPosition.TOP_LEFT]
                .push(document.getElementById('pac-input'));

            google.maps.event.addListener(searchBox, 'places_changed', function() {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                var bounds = new google.maps.LatLngBounds();
                places.forEach(function (place) {

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                vm.inMap.map.fitBounds(bounds);
            })

            vm.lastZoomLevel = vm.inMap.map.getZoom();
        };

        vm.updateMarkerIcon = function (rtgps) {
            // vm.markersByPath[rtgps.vehiclepath].icon.fillColor = vm.getMarkerColor(rtgps);
            // vm.markersByPath[rtgps.vehiclepath].icon.rotation = rtgps.direction;
            vm.markersByPath[rtgps.vehiclepath].icon = vm.getIcon(rtgps);
            vm.markersByPath[rtgps.vehiclepath].icon.origin = new google.maps.Point(0, vm.getDirection(rtgps));
            vm.markersByPath[rtgps.vehiclepath].setIcon(vm.markersByPath[rtgps.vehiclepath].icon);
        };


        vm.onload = function () {
            $scope.$apply(function () {
                $compile(document.getElementById("markerWindow"))($scope);
            });
        };


        vm.fenceWindowLoad = function () {
            $scope.$apply(function () {
                $compile(document.getElementById("fenceWindow"))($scope);
            });
        };


        vm.mobilize = function (mobilityRequest) {
            vm.inMap.markers.clickedMarker.rtgps.mobilityRequest = mobilityRequest;

            // $log.log(vm.inMap.markers.clickedMarker);

            var immobalizeDialog = $mdDialog.confirm({
                controller: 'ImmobalizeController',
                templateUrl: 'app/components/landingpage/dashboard/map/immobalize-dialog.html',
                clickOutsideToClose: true,
                escapeToClose: true,
                locals: {
                    params: {
                        clickedMarker: vm.inMap.markers.clickedMarker.rtgps
                    }
                }
            }).ok('Yes').cancel('No');

            $mdDialog.show(immobalizeDialog)
                .then(function () {
                    //$log.log("Yes Function");
                }, function () {
                    //$log.log("No Function");
                })
        };


        vm.showHistory = function () {
            // $log.log("show History");
            historyService.setData('getHistory', false);
            historyService.historyMap.traceObj = [];
            mapService.showHistory();
        };


        function setMapHeight() {
            // console.log('hel man');
            wh = $(window).height();
            // isRendered('.angular-google-map-container', function (el) {
            //     el.css('height', (wh - header_height) + 'px');
            // });
            isRendered('.alert-md-content', function (el) {
                el.css('height', (wh - header_height) + 'px');
            });

            isRendered('#map', function (el) {
                el.css('height', (wh - header_height) + 'px');
            });
        }

        $(window).resize(function () {
            setMapHeight();
        });

        function isRendered(el, callback) {
            var isr_interval = setInterval(function () {
                if ($(el).length > 0) {
                    callback($(el));
                    clearInterval(isr_interval);
                }
            }, 200)
        }


        var MAP_STYLES = {
            DARK: 'dark',
            DEFAULT: 'default'
        };


        vm.triggerMarkerIconChange = function () {
            if (Math.abs(vm.inMap.map.getZoom() - vm.lastZoomLevel) > 2) {
                //console.log("changing marker icons");
                vm.changeMarkerIcon();
            }
            vm.markerIconChangeTriggered = false;
        };


        vm.changeMapStyle = function () {
            var zoom = vm.inMap.map.getZoom();
            if (zoom < 10) {
                if (vm.inMap.styleType != MAP_STYLES.DARK) {
                    vm.inMap.styleType = MAP_STYLES.DARK;
                    vm.inMap.map.setOptions({styles: mapService.mapStyles[MAP_STYLES.DARK]})
                }
            } else {
                if (vm.inMap.styleType != MAP_STYLES.DEFAULT) {
                    vm.inMap.styleType = MAP_STYLES.DEFAULT;
                    vm.inMap.map.setOptions({styles: mapService.mapStyles[MAP_STYLES.DEFAULT]})
                }
            }
        };

        var RED_ICON = 'red';
        var GREEN_ICON = 'green';
        var BLUE_ICON = 'blue';
        var ORANGE_ICON = 'orange';


        vm.getMarkerColor = function (rtgps) {
            // $log.log(rtgps.vehicleno, rtgps.mobilistatus, rtgps.ignitionstatus);
            if (!rtgps.mobilistatus) {
                return RED_ICON;
            } else {
                if (rtgps.ignitionstatus) {
                    return GREEN_ICON;
                } else {
                    return BLUE_ICON;
                }
            }
            return ORANGE_ICON;
        };


        vm.getIconURL = function (rtgps) {
            return ['assets/images/markers', 'extralarge', vm.getMarkerColor(rtgps) + '-dot.png'].join('/');
        };


        var SCALE = 16;


        vm.zoomChanged = function () {
            if (vm.checkZoomLevel(1, 8)) {
                SCALE = 8;
            } else if (vm.checkZoomLevel(9, 10)) {
                SCALE = 16;
            } else if (vm.checkZoomLevel(11, 12)) {
                SCALE = 24;
            } else if (vm.checkZoomLevel(13, 14)) {
                SCALE = 32;
            } else {
                SCALE = 40;
            }


            vm.changeMarkerIcon();

            vm.changeMapStyle();
            //$timeout(vm.changeMarkerIcon, 1000);
        };


        vm.changeMarkerIcon = function () {
            for (var idx in vm.inMap.markers.markersByPath) {
                var marker = vm.inMap.markers.markersByPath[idx];
                var icon = marker.icon;
                var rtgps = vehicleService.vehiclesByPath[marker.vehiclepath].rtgps;

                icon.size = new google.maps.Size(SCALE, SCALE);
                icon.origin = new google.maps.Point(0, vm.getDirection(rtgps));
                icon.scaledSize = new google.maps.Size(SCALE, SCALE * 36);
                icon.anchor = new google.maps.Point(SCALE / 2, SCALE / 2);
                marker.setIcon(icon);
            }
        };


        vm.getDirection = function (rtgps) {
            if (rtgps.direction == null)
                return 0;

            var direction = Math.floor(rtgps.direction / 10) * SCALE;
            if (direction > SCALE * 36)
                direction = SCALE * 36;

            // console.log(direction);
            return direction;
        };


        vm.getIcon = function (rtgps) {
            return {
                url: vm.getIconURL(rtgps),
                size: new google.maps.Size(SCALE, SCALE),
                origin: new google.maps.Point(0, vm.getDirection(rtgps)),
                scaledSize: new google.maps.Size(SCALE, SCALE * 36),
                anchor: new google.maps.Point(SCALE / 2, SCALE / 2)
            };
        };


        vm.checkZoomLevel = function (min, max) {
            return (vm.inMap.map.getZoom() >= min && vm.inMap.map.getZoom() <= max);
        };


        vm.resizeMap = function () {
            google.maps.event.trigger(vm.inMap.map, 'resize');
            return true;
        };


        vm.runStatsAtStart = function () {
            for (var runtime = 5000; runtime < 15000; runtime += 5000) {
                $timeout(vm.runStats, runtime);
            }

            $interval(vm.runStats, 15000);
        };


        vm.init = function () {
            vm.loadMap();
            setMapHeight();
            vm.addListener();

            vm.runStatsAtStart();

            markerInfowindow.addListener('domready', function () {
                vm.onload();
            });

            fenceInfowindow.addListener('domready', function () {
                vm.fenceWindowLoad();
            });

            $interval(vm.resizeMap, 1000);

            vm.inMap.map.addListener('zoom_changed', function () {
                vm.zoomhappened = true;
                //vm.zoomChanged();
            });

            vm.inMap.map.addListener('tilesloaded', function () {
                vm.zoomChanged();
            });
        };

        $scope.$on('downloadView', vm.downloadView);

        vm.init();
    }


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
            // $log.log(resp);
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
                        // $log.log(resp);
                    });
        };


        $scope.init = function () {
            $scope.commandSent = false;
            $scope.msg = params.clickedMarker.mobilityRequest ? "Mobilize ?" : "Immobilize ?";
        };

        $scope.init();

        var red = '#ff4955';
        var green = '#27ae60'; //new color code for green #2ad230
        var blue = '#4673ff';
        var yellow = '#f3b212';
        var orange = '#f37813';
    }

})();


// if(str == 'red'){
//     color = '#e74c3c'
// }else if(str == 'green'){
//     color = '#27ae60'
// }else if(str == 'blue'){
//     color = '#0000ff'
// }else if(str == 'yellow'){
//     color = '#f39c12'
// }
