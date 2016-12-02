(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('ImmobalizeController', ImmobalizeController);


    function MapController($scope, $log, cpuService, mapService,
                                 $interval, geofenceViewService, $timeout, customMapOverlay, $compile,
                                 vehicleService, historyService, $state, $mdDialog) {
        $log.log('MapController');
        var vm = this;

        var wh = $(window).height();
        var header_height = 95;

        var markerInfowindow = new google.maps.InfoWindow();
        var fenceInfowindow = new google.maps.InfoWindow();


        vm.inMap = mapService.getMainMap();
        vm.inMarkers = vm.inMap.markers.inMarkers;
        vm.markersByPath = vm.inMap.markers.markersByPath;
        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.filterStr = '';
        vm.excludeFilters = ['icon', 'le', 'onroad', 'regno', 'team', 'carbattery', 'devbattery'];
        vm.markerIconChangeTriggered = false;

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
            if ((rtgps.vehiclepath in vm.inCustomMaker) && ( vm.geoFilters.showVehicleNumber || vm.geoFilters.noComm || vm.geoFilters.devBattery || vm.geoFilters.carBattery )) {
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
            // $log.log("runFilters");
            vm.filterStr = filterStr;
            markerInfowindow.close();

            if (vm.filterStr.length == 0) {
                vm.showAllMarkers();
                return;
            }

            var centerMap = false;
            if (vm.filterStr.length > 2) {
                for (var idx in vm.markersByPath) {
                    var visible = vm.applyFilterToMarker(vehicleService.vehiclesByPath[idx].rtgps, filterStr);
                    if (visible && !centerMap) {
                        vm.inMap.map.setCenter(vm.markersByPath[idx].getPosition());
                        centerMap = true;
                    }
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
                console.log(rtgps.vehiclepath);
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
                if (rtgps.vehiclepath in vm.inCustomMaker && vm.geoFilters.showVehicleNumber) {
                    vm.inCustomMaker[rtgps.vehiclepath].show();
                }
            }

            visible = vm.checkRoaded(rtgps) && visible;
            vm.markersByPath[rtgps.vehiclepath].setVisible(visible);

            if (rtgps.vehiclepath in vm.inCustomMaker) {
                if (visible && vm.geoFilters.showVehicleNumber) {
                    vm.inCustomMaker[rtgps.vehiclepath].show();
                } else {
                    vm.inCustomMaker[rtgps.vehiclepath].hide();
                }
            }
            return visible;
        };


        vm.matchesAnyMarkerData = function (rtgps, filterStr) {
            cpuService.track('new_one');
            for (var eachidx in rtgps) {
                if (vm.excludeFilters.indexOf(eachidx) != -1)
                    continue;

                if (rtgps[eachidx] == null)
                    continue;

                var lowercasefilterStr = filterStr.toString().toLowerCase();
                var lowercaseMarkerStr = rtgps[eachidx].toString().toLowerCase();

                if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                    return true;
                }


                if (rtgps[eachidx].constructor == Object) {
                    for (var myMeta in rtgps[eachidx]) {
                        if (vm.excludeFilters.indexOf(eachidx) != -1)
                            continue;
                        if (rtgps[eachidx][myMeta]) {
                            var lowercasefilterStr = filterStr.toString().toLowerCase();
                            // $log.log(rtgps[eachidx][myMeta]);
                            var lowercaseMarkerStr = rtgps[eachidx][myMeta].toString().toLowerCase();

                            if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                                return true;
                            }
                        }
                    }
                }
            }
            cpuService.track('new_one');
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

            //$timeout(vm.runStats, 10000);
            // $log.log(vm.vehicleStats);
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

        var DEFAULT_STROKE = 10;
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
        }

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
                    center: {lat: circles[idx].center.latitude, lng: circles[idx].center.longitude},
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
        }

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
                        if (vehicleService.vehiclesByPath[idx].rtgps.carbattery < CARBATTERY_THRESHOLD && vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {

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
                        if (vehicleService.vehiclesByPath[idx].rtgps.devbattery < DEVBATTERY_THRESHOLD && vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {
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
                            startAnimation(vm.circlesByPath[idx]);
                        }
                    }
                }
                if (vm.polygonsByPath) {
                    for (var idx in vm.polygonsByPath) {
                        filterStr = vm.polygonsByPath[idx].control.info.tagdata;
                        vm.polygonsByPath[idx].googleObject.setMap(null);
                        if (checkFilterString(filterStr)) {
                            vm.polygonsByPath[idx].googleObject.setMap(vm.currentMap);
                            startAnimation(vm.polygonsByPath[idx]);
                        }
                    }
                }
            }
        };

        function checkNoComm(marker, callback) {
            var currentTime = new Date().getTime();
            var lastSeenAt = marker.timestamp.getTime();
            var noCommThreshold = 8 * 3600 * 1000;
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
                //return '#f89406';
                return '#bc31ff';
            } else if (type == COMPETITOR_HUB) {
                return 'red';
            } else if (type == CITY_LIMIT) {
                return 'blue';
            }

            var x = "#bc31ff";
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
                if(vm.markersByPath[vm.inCustomMaker[idx].args.marker.vehiclepath].getVisible()){
                    vm.inCustomMaker[idx].show();
                    vm.inCustomMaker[idx].showVehicleNumber();
                }else{
                    vm.inCustomMaker[idx].hide();
                    vm.inCustomMaker[idx].hideVehicleNumber();
                }
            }
        }

        vm.showVehicleNumber = function (vn) {
            vm.runFilters(vm.filterStr);
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

            vm.lastZoomLevel = vm.inMap.map.getZoom();
        };

        vm.updateMarkerIcon = function (rtgps) {
            vm.markersByPath[rtgps.vehiclepath].icon.fillColor = vm.getMarkerColor(rtgps);
            vm.markersByPath[rtgps.vehiclepath].icon.rotation = rtgps.direction;
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

            $log.log(vm.inMap.markers.clickedMarker);

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
        }


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


        vm.init = function () {
            vm.loadMap();
            setMapHeight();
            vm.addListener();

            $timeout(vm.runStats, 5000);
            $interval(vm.runStats, 10000);

            markerInfowindow.addListener('domready', function () {
                vm.onload();
            });

            fenceInfowindow.addListener('domready', function () {
                vm.fenceWindowLoad();
            });

            $interval(vm.resizeMap, 1000);

            vm.inMap.map.addListener('zoom_changed', function () {
                vm.zoomChanged();
            });

            // vm.infoWindowCompiled = false;
            // vm.inMap.map.addListener('tilesloaded', function() {
            //     if(vm.infoWindowCompiled)
            //         return;
            //     vm.onload();
            // vm.infoWindowCompiled = true;
            // });
        };

        var MAP_STYLES = {
            DARK: 'dark',
            DEFAULT: 'default'
        };


        vm.changeMarkerIcon = function () {
            var scale = vm.getIconScale();
            for (var idx in vm.inMap.markers.markersByPath) {
                vm.inMap.markers.markersByPath[idx].icon.scale = scale;
                vm.inMap.markers.markersByPath[idx].setIcon(vm.inMap.markers.markersByPath[idx].icon);
            }
            vm.lastZoomLevel = vm.inMap.map.getZoom();
        };


        vm.triggerMarkerIconChange = function() {
            if (Math.abs(vm.inMap.map.getZoom() - vm.lastZoomLevel) > 2) {
                //console.log("changing marker icons");
                vm.changeMarkerIcon();
            }
            vm.markerIconChangeTriggered = false;
        };


        vm.zoomChanged = function () {
            if(!vm.markerIconChangeTriggered) {
                vm.markerIconChangeTriggered = true;
                $timeout(vm.triggerMarkerIconChange, 4000);
            }

            //console.log("zoom = ", vm.inMap.map.getZoom());
            //$timeout(vm.changeMapStyle(), 3000);
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

            // if(str == 'red'){
            //     color = '#e74c3c'
            // }else if(str == 'green'){
            //     color = '#27ae60'
            // }else if(str == 'blue'){
            //     color = '#0000ff'
            // }else if(str == 'yellow'){
            //     color = '#f39c12'
            // }
        };


        vm.getIconScale = function () {
            var scale = 0.8 + (vm.inMap.map.getZoom() - 11) * 0.4 / 4;
            if (scale < 0.3)
                scale = 0.3;
            return scale;
        };

        vm.getIcon = function (rtgps) {
            var direction = rtgps.direction;
            if (direction != null) {
                direction = 0;
            }

            return {
                path: "M20.029,15c0,2.777-2.251,5.028-5.029,5.028c-2.778,0-5.029-2.251-5.029-5.028 c0-2.778,2.251-5.029,5.029-5.029C17.778,9.971,20.029,12.222,20.029,15z M15,3.931L9.893,9.938c0,0,1.71-1.095,5.107-1.095 c3.396,0,5.107,1.095,5.107,1.095L15,3.931z",
                fillColor: vm.getMarkerColor(rtgps),
                rotation: direction,
                fillOpacity: 1,
                anchor: new google.maps.Point(15, 15),
                strokeWeight: 1,
                strokeColor: '#ffffff',
                scale: vm.getIconScale()
            }
        };

        vm.resizeMap = function () {
            google.maps.event.trigger(vm.inMap.map, 'resize');
            return true;
        };


        vm.init();
    }




    function ImmobalizeController($scope, $log, $mdDialog, params, intellicarAPI, vehicleService) {
        //var vm = this;
        //$log.log('ImmobalizeController');


        $log.log(params);
        $log.log('ssssssssssssssssssssssss');
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
    }

})();
