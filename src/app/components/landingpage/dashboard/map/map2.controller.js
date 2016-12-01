(function () {

    angular
        .module('uiplatform')
        .controller('GoogleMapController', GoogleMapController);

    function GoogleMapController($scope, $log, cpuService, newMapService,
                                 $interval, geofenceViewService, $timeout, customMapOverlay, $compile,
                                 vehicleService, history2Service) {
        $log.log('MapController');
        var vm = this;

        var wh = $(window).height();
        var header_height = 95;

        var markerInfowindow = new google.maps.InfoWindow();
        var fenceInfowindow = new google.maps.InfoWindow();


        vm.inMap = newMapService.getMainMap();
        vm.inMarkers = vm.inMap.markers.inMarkers;
        vm.markersByPath = vm.inMap.markers.markersByPath;
        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.fenceInfoWindow = vm.inMap.fenceInfoWindow;
        vm.filterStr = '';
        vm.excludeFilters = ['icon', 'le', 'onroad', 'regno', 'team', 'carbattery', 'devbattery'];

        vm.onRoaded = true;
        vm.offRoaded = false;

        vm.leftToolbar = function () {
            return geofenceViewService.getToolbarVar();
        };


        vm.loadMap = function () {
            vm.inMap.zoom = newMapService.getZoom();
            vm.inMap.center = newMapService.getCenter();
            vm.inMap.bounds = newMapService.getBounds();
            vm.createMap();
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
            if(model.vehiclepath in vm.markersByPath) {
                //delete model['marker'];
                console.log(model.vehiclepath);
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
                icon: newMapService.getIcon(rtgps),
                vehiclepath: rtgps.vehiclepath
            });

            // var data = rtgps.vehiclepath;

            if (!(rtgps.vehiclepath in vm.markersByPath)) {
                vm.markersByPath[rtgps.vehiclepath] = marker;
            }

            google.maps.event.addListener(marker, 'click', function (event) {
                vm.setClickedMarker(this);
                markerInfowindow.setContent(document.getElementById("marker_infowindow").innerHTML);

                $log.log(this);
                markerInfowindow.open(map, this);
            });

            marker.setMap(vm.inMap.map);
            vm.customOverlay(rtgps);
        };

        vm.updateMarker = function (rtgps) {
            if ((rtgps.vehiclepath in vm.inCustomMaker) && ( vm.geoFilters.showVehicleNumber || vm.geoFilters.noComm || vm.geoFilters.devBattery ||vm.geoFilters.carBattery )) {
                vm.inCustomMaker[rtgps.vehiclepath].setPosition(rtgps);
            }

            if (rtgps.vehiclepath in vm.markersByPath) {
                var markerPos = new google.maps.LatLng(rtgps.latitude, rtgps.longitude);
                vm.markersByPath[rtgps.vehiclepath].setPosition(markerPos);
                vm.updateMarkerIcon(rtgps);
            }

            vm.applyFilterToMarker(rtgps, vm.filterStr);
        };


        vm.showAllMarkers = function() {
            for (var idx in vm.markersByPath) {
                var rtgps = vehicleService.vehiclesByPath[idx].rtgps;
                vm.markersByPath[idx].setVisible(vm.checkRoaded(rtgps) && true);
            }
        };

        vm.runFilters = function (filterStr) {
            // $log.log("runFilters");
            vm.filterStr = filterStr;
            markerInfowindow.close();

            if(vm.filterStr.length == 0) {
                vm.showAllMarkers();
                return;
            }

            var centerMap = false;
            if(vm.filterStr.length > 2) {
                for (var idx in vm.markersByPath) {
                    var visible = vm.applyFilterToMarker(vehicleService.vehiclesByPath[idx].rtgps, filterStr);
                    if(visible && !centerMap) {
                        vm.inMap.map.setCenter(vm.markersByPath[idx].getPosition());
                        centerMap = true;
                    }
                }
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
            $log.log('mapcontroller');
            // $log.log(fences);
            // vm.inMap.circles = fences.circles;
            // newMapService.inMap.circles = fences.circles;
            // newMapService.inMap.polygons = fences.polygons;
            geofenceViewService.setData('geofences', true);
            vm.applyFilters({filterType: 'showAll'});

            vm.createPolygons(fences.polygons);
            vm.createCircles(fences.circles);

            // vm.showMyPolygons();
            // vm.showMyCircles();
        };

        vm.createPolygons = function(polygons){
            var polygonMap = {};
            for(var idx in polygons){
                var paths = [];
                for (var j = 0; j < polygons[idx].path.length; j++) {
                    paths.push(new google.maps.LatLng(polygons[idx].path[j].latitude,
                        polygons[idx].path[j].longitude));
                }
                var googlePolygon = new google.maps.Polygon({
                    path: paths,
                    strokeColor: polygons[idx].strokeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: polygons[idx].strokeWeight,
                    fillColor: polygons[idx].fillColor,
                    fillOpacity: polygons[idx].fillOpacity
                });
                polygons[idx].googleObject = googlePolygon;
                polygonMap[polygons[idx].control.info.assetpath] = polygons[idx];
            }
            vm.polygonsByPath = polygonMap;
        }

        vm.createCircles = function(circles){
            var circlesMap = {};
            for(var idx in circles){
                var googleCircle = new google.maps.Circle({
                    strokeColor: circles[idx].strokeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: circles[idx].strokeWeight,
                    fillColor: circles[idx].fillColor,
                    fillOpacity: circles[idx].fillOpacity,
                    center: {lat: circles[idx].center.latitude,lng: circles[idx].center.longitude},
                    radius: circles[idx].radius
                });

                google.maps.event.addListener(googleCircle, 'click', function (e) {
                    var contentString = "<table><tbody>\
                                            <tr>\
                                                <th>Name:</th>\
                                                <td>{{vm.selectedFenceObj.name}}</td>\
                                            </tr>\
                                            <tr>\
                                                <th>Type:</th>\
                                                <td>{{vm.selectedFenceObj.other.olafilter}}</td>\
                                            </tr>\
                                        </tbody></table>";
                    fenceInfowindow.setContent(contentString);
                    fenceInfowindow.open(vm.inMap.map, this);
                });
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
                        if (vehicleService.vehiclesByPath[idx].rtgps.carbattery < CARBATTERY_THRESHOLD &&  vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {

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
                        if (vehicleService.vehiclesByPath[idx].rtgps.devbattery < DEVBATTERY_THRESHOLD &&  vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)) {
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
                            if(vm.checkRoaded(vehicleService.vehiclesByPath[idx].rtgps)){
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
                if (vm.circlesByPath) {
                    for (var idx in vm.circlesByPath.length) {
                        var filterStr = vm.circlesByPath[idx].control.info.tagdata;
                        if (checkFilterString(filterStr)) {
                            vm.circlesByPath[idx].googleObject.setMap(vm.inMap.map);
                            vm.circlesByPath[idx].strokeWeight = getStroke(filterStr);
                            vm.circlesByPath[idx].strokeColor = getColor(filterStr);
                            startAnimation(vm.circlesByPath[idx]);
                        } else {
                            vm.circlesByPath[idx].googleObject.setMap(null);
                        }
                    }
                }
                if(vm.polygonsByPath){
                    for(var idx in vm.polygonsByPath){
                        filterStr = vm.polygonsByPath[idx].control.info.tagdata;
                        if (checkFilterString(filterStr)) {
                            vm.polygonsByPath[idx].googleObject.setMap(vm.inMap.map);
                            vm.polygonsByPath[idx].strokeWeight = getStroke(filterStr);
                            vm.polygonsByPath[idx].strokeColor = getColor(filterStr);
                            startAnimation(vm.polygonsByPath[idx]);
                        } else {
                            vm.polygonsByPath[idx].googleObject.setMap(null);
                            // if (filterData.filterType == 'cityLimits') {
                                // $log.log(filterData.filterType + " == check == " + vm.polygons[idx].visible);
                            // }
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
            newMapService.addListener('rtgps', vm.updateMarker);
            geofenceViewService.addListener('getMyFences', vm.getMyFences);
            geofenceViewService.addListener('applyFilters', vm.applyFilters);
        };

        // Google Map Custom HTML Marker ================================================================================================================

        vm.inCustomMaker = {};

        newMapService.highlightMarker = function (vehiclePath) {
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
                vm.inCustomMaker[rtgps.vehiclepath] = new customMapOverlay.CustomMarker(rtgps.latitude, rtgps.longitude, newMapService.inMap.map, {marker: rtgps});
            }
        };
        vm.showVehicleNumber = function (vn) {
            vm.runFilters(vm.filterStr);
            vm.vehicleNumber = vn;
            if (vm.vehicleNumber) {
                for (idx in vm.inCustomMaker) {
                    vm.inCustomMaker[idx].show();
                    vm.inCustomMaker[idx].showVehicleNumber();
                }
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
            }
            vm.inMap.map = new google.maps.Map(mapCanvas, vm.inMap.mapOptions);

            vm.inMap.map.addListener('click', function () {
                markerInfowindow.close();
                fenceInfowindow.close();
            });
        };

        vm.updateMarkerIcon = function (rtgps) {
            vm.markersByPath[rtgps.vehiclepath].icon.fillColor = newMapService.getMarkerColor(rtgps);
            vm.markersByPath[rtgps.vehiclepath].icon.rotation = rtgps.direction;
            vm.markersByPath[rtgps.vehiclepath].setIcon(vm.markersByPath[rtgps.vehiclepath].icon);
        };


        vm.showMyPolygons = function () {
            for (var i = 0; i < vm.inMap.polygons.length; i++) {
                var paths = [];
                for (var j = 0; j < vm.inMap.polygons[i].path.length; j++) {
                    paths.push(new google.maps.LatLng(vm.inMap.polygons[i].path[j].latitude,
                        vm.inMap.polygons[i].path[j].longitude));
                }
                var polygon = new google.maps.Polygon({
                    path: paths,
                    strokeColor: vm.inMap.polygons[i].strokeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: vm.inMap.polygons[i].strokeWeight,
                    fillColor: vm.inMap.polygons[i].fillColor,
                    fillOpacity: vm.inMap.polygons[i].fillOpacity
                });
                polygon.setMap(vm.inMap.map);
            }
        };

        vm.showMyCircles = function () {
            for (var i = 0; i < vm.inMap.circles.length; i++) {
                var circle = new google.maps.Circle({
                    strokeColor: vm.inMap.circles[i].strokeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: vm.inMap.circles[i].strokeWeight,
                    fillColor: vm.inMap.circles[i].fillColor,
                    fillOpacity: vm.inMap.circles[i].fillOpacity,
                    center: {lat: vm.inMap.circles[i].center.latitude, lng: vm.inMap.circles[i].center.longitude},
                    radius: vm.inMap.circles[i].radius
                });

                google.maps.event.addListener(circle, 'click', function (e) {
                    var contentString = "<table><tbody>\
                                            <tr>\
                                                <th>Name:</th>\
                                                <td>{{vm.selectedFenceObj.name}}</td>\
                                            </tr>\
                                            <tr>\
                                                <th>Type:</th>\
                                                <td>{{vm.selectedFenceObj.other.olafilter}}</td>\
                                            </tr>\
                                        </tbody></table>";

                    fenceInfowindow.setContent(contentString);
                    fenceInfowindow.open(vm.inMap.map, this);
                });

                circle.setMap(vm.inMap.map);
            }
        };


        vm.onload = function () {
            $scope.$apply(function () {
                $compile(document.getElementById("markerWindow"))($scope);
            });
        };


        vm.showHistory = function () {
            $log.log("show History");
            history2Service.setData('getHistory', false);
            history2Service.historyMap.traceObj = [];
            newMapService.showHistory();
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

            $interval(vm.resizeMap, 1000);

            vm.inMap.map.addListener('zoom_changed', function () {
                newMapService.zoomChanged();
                vm.changeMapStyle();
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
            DARK:'dark',
            DEFAULT:'default'
        }

        vm.changeMapStyle = function () {
            var zoom = vm.inMap.map.getZoom();
            if(zoom < 11){
                if(vm.inMap.styleType != MAP_STYLES.DARK){
                    vm.inMap.styleType = MAP_STYLES.DARK;
                    vm.inMap.map.setOptions({ styles : newMapService.mapStyles[MAP_STYLES.DARK] })
                }
            }else{
                if(vm.inMap.styleType != MAP_STYLES.DEFAULT) {
                    vm.inMap.styleType = MAP_STYLES.DEFAULT;
                    vm.inMap.map.setOptions({styles: newMapService.mapStyles[MAP_STYLES.DEFAULT]})
                }
            }
        }

        vm.resizeMap = function () {
            google.maps.event.trigger(vm.inMap.map, 'resize');
            return true;
        };


        vm.init();
    }

})();
