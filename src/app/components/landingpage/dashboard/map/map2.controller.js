(function () {

    angular
        .module('uiplatform')
        .controller('GoogleMapController', GoogleMapController);

    function GoogleMapController($scope, $log,cpuService, newMapService,
                                 $interval, geofenceViewService, $timeout, customMapOverlay, $compile,
                                 vehicleService) {
        $log.log('MapController');
        var vm = this;

        var wh = $(window).height();
        var header_height = 95;

        var markerInfowindow = new google.maps.InfoWindow();
        var fenceInfowindow = new google.maps.InfoWindow();


        vm.inMap = newMapService.getMainMap();
        vm.inMarkers = vm.inMap.markers.inMarkers;
        vm.markerByPath = vm.inMap.markers.markerByPath;
        vm.selectedFenceObj = vm.inMap.selectedFenceObj;
        vm.fenceInfoWindow = vm.inMap.fenceInfoWindow;
        vm.filterStr = '';
        vm.excludeFilters = ['icon', 'le', 'onroad', 'regno', 'team', 'carbattery', 'devbattery'];

        vm.onRoaded = true;
        vm.offRoaded = false;

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



        vm.updateMarker2 = function (rtgps) {
            // $log.log('updateMarker2');
            // $log.log(rtgps);

            vm.inMarkers.push(rtgps);
            vm.customOverlay(rtgps);
            var markerPos = new google.maps.LatLng(rtgps.latitude,
                rtgps.longitude
            );

            var marker = new google.maps.Marker({
                position:markerPos,
                icon: rtgps.icon,
                vehiclepath:rtgps.vehiclepath
            });

            marker.setMap(vm.inMap.map);

            var data = rtgps.vehiclepath;

            vm.markerByPath[rtgps.vehiclepath] ={};
            vm.markerByPath[rtgps.vehiclepath] = marker;

            google.maps.event.addListener(marker, 'click', function(event) {
                newMapService.setClickedMarker(this);
                markerInfowindow.setContent(document.getElementById("marker_infowindow").innerHTML);
                $scope.clickedMarker = vm.inMap.markers.clickedMarker;
                $scope.hideMobilityControls =  vm.inMap.markers.clickedMarker.hideMobilityControls;
                markerInfowindow.open(map, this);
            });
        };

        vm.updateMarker = function (vehicleData) {
            // if ((vehicleData.vehiclepath in vm.inCustomMaker) && vm.geoFilters.showVehicleNumber ) {
            if ((vehicleData.vehiclepath in vm.inCustomMaker) && vm.geoFilters.showVehicleNumber ) {
                // vm.inCustomMaker[vehicleData.vehiclepath].setPosition(vehicleData);
            }
            vm.getMarkers(vehicleData);
            // vm.applyFilterToMarker(vehicleData, vm.filterStr);
        };


        vm.runFilters = function (filterStr) {
            // $log.log("runFilters");
            // newMapService.infoWindowClose();
            vm.filterStr = filterStr;
            markerInfowindow.close();

            for (var idx in vm.inMarkers) {
                vm.applyFilterToMarker(vm.inMarkers[idx], filterStr);
            }
        };

        vm.applyFilterToMarker = function (marker, filterStr) {
            if (!vm.matchesAnyMarkerData(marker, filterStr)) {
                marker.options.visible = false;
                marker.markerInfo.setVisible(false);
                if (marker.vehiclepath in vm.inCustomMaker) {
                    vm.inCustomMaker[marker.vehiclepath].hide();
                }
            } else {
                marker.options.visible = true;
                marker.markerInfo.setVisible(true);
                if (marker.vehiclepath in vm.inCustomMaker  && vm.geoFilters.showVehicleNumber) {
                    vm.inCustomMaker[marker.vehiclepath].show();
                }
            }
            marker.options.visible = vm.checkRoaded(marker) && marker.options.visible;
            marker.markerInfo.setVisible(marker.options.visible);
            if (marker.vehiclepath in vm.inCustomMaker) {
                if (marker.options.visible  && vm.geoFilters.showVehicleNumber) {
                    vm.inCustomMaker[marker.vehiclepath].show();
                } else {
                    vm.inCustomMaker[marker.vehiclepath].hide();
                }
            }
            return marker.options.visible;
        };


        vm.matchesAnyMarkerData = function (marker, filterStr) {
            cpuService.track('new_one');
            for (var eachidx in marker) {
                if (vm.excludeFilters.indexOf(eachidx) != -1)
                    continue;

                if (marker[eachidx]) {
                    var lowercasefilterStr = filterStr.toString().toLowerCase();
                    var lowercaseMarkerStr = marker[eachidx].toString().toLowerCase();

                    if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                        return true;
                    }
                }

                if (marker[eachidx].constructor == Object) {
                    for (var myMeta in marker[eachidx]) {
                        if (vm.excludeFilters.indexOf(eachidx) != -1)
                            continue;
                        if (marker[eachidx][myMeta]) {
                            var lowercasefilterStr = filterStr.toString().toLowerCase();
                            // $log.log(marker[eachidx][myMeta]);
                            var lowercaseMarkerStr = marker[eachidx][myMeta].toString().toLowerCase();

                            if (lowercaseMarkerStr.includes(lowercasefilterStr)) {
                                return true;
                            }
                        }
                    }
                }
            }
            cpuService.track('new_one');

            //$log.log("not matching " + marker.id);
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

            $timeout(vm.runStats, 10000);
            // $log.log(vm.vehicleStats);
        };


        vm.getStats = function (filterStr) {
            var count = 0;
            vm.vehicleStats.noComm = 0;
            vm.vehicleStats.devPullout = 0;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (vm.checkRoaded(marker)) {
                    checkNoComm(marker, function (marker) {
                        vm.vehicleStats.noComm++;
                    });
                    if(marker.carbattery < 2){
                        vm.vehicleStats.devPullout++;
                    }
                    if (vm.matchesAnyMarkerData(marker, filterStr)) {
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


        vm.getMyFencesListener = function (fences) {
            $log.log('mapcontroller');
            // $log.log(fences);
            // vm.inMap.circles = fences.circles;
            newMapService.inMap.circles = fences.circles;
            newMapService.inMap.polygons = fences.polygons;
            geofenceViewService.setData('geofences', true);
            vm.applyFilters({filterType: 'showAll'});

            vm.showMyPolygons();
            vm.showMyCircles();
        };

        var DEVBATTERY_THRESHOLD = 3.55;
        var CARBATTERY_THRESHOLD = 9.5;

        vm.applyFilters = function (filterData, recall) {
            var idx;
            var marker;
            if(recall == null) {
                recall = 1;
            }

            if (filterData.filterType == 'carBattery') {
                for (idx in vm.inMarkers) {
                    marker = vm.inMarkers[idx];
                    if (vm.geoFilters.carBattery) {
                        if (marker.carbattery < CARBATTERY_THRESHOLD) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                            marker.markerInfo.setAnimation(google.maps.Animation.BOUNCE)
                        }
                    } else {
                        if(recall == 1) {
                            marker.options.animation = null;
                            marker.markerInfo.setAnimation(null);
                            vm.applyFilters({filterType: 'devBattery'}, recall - 1);
                            vm.applyFilters({filterType: 'noComm'}, recall - 1);
                        }
                    }
                }
            } else if (filterData.filterType == 'devBattery') {
                for (idx in vm.inMarkers) {
                    marker = vm.inMarkers[idx];
                    if (vm.geoFilters.devBattery) {
                        if (marker.devbattery < DEVBATTERY_THRESHOLD) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                            marker.markerInfo.setAnimation(google.maps.Animation.BOUNCE)
                        }
                    } else {
                        if(recall == 1) {
                            marker.options.animation = null;
                            marker.markerInfo.setAnimation(null);
                            vm.applyFilters({filterType: 'carBattery'}, recall - 1);
                            vm.applyFilters({filterType: 'noComm'}, recall - 1);
                        }

                    }
                }
            } else if (filterData.filterType == 'noComm') {
                for (idx in vm.inMarkers) {
                    marker = vm.inMarkers[idx];
                    if (vm.geoFilters.noComm) {
                        checkNoComm(marker, function (marker) {
                            marker.options.animation = google.maps.Animation.BOUNCE;
                            marker.markerInfo.setAnimation(google.maps.Animation.BOUNCE)
                        });
                    }
                    else {
                        if(recall == 1) {
                            marker.options.animation = null;
                            marker.markerInfo.setAnimation(null);
                            vm.applyFilters({filterType: 'devBattery'}, recall - 1);
                            vm.applyFilters({filterType: 'carBattery'}, recall - 1);
                        }
                    }
                }
            } else if (filterData.filterType == 'showVehicleNo') {
                // Do something to notify showVehicleNo filter is On
            } else {
                if (vm.inMap.circles) {
                    //$log.log(vm.inMap.circles);
                    for (idx = 0; idx < vm.inMap.circles.length; idx++) {
                        var filterStr = vm.inMap.circles[idx].control.info.tagdata;
                        // $log.log(filterData.filterType + ", checkfilterstr = " + checkFilterString(filterStr));
                        if (checkFilterString(filterStr)) {
                            vm.inMap.circles[idx].visible = true;
                            // vm.inMap.circles[idx].circleInfo.setVisible(true);
                            vm.inMap.circles[idx].stroke.weight = getStroke(filterStr);
                            vm.inMap.circles[idx].stroke.color = getColor(filterStr);
                            startAnimation(vm.inMap.circles[idx]);
                        } else {
                            vm.inMap.circles[idx].visible = false;
                            // console.log(newMapService.inMap.circles[idx]);
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

        function checkNoComm(marker, callback) {
            var currentTime = new Date().getTime();
            var lastSeenAt = marker.timestamp.getTime();
            var noCommThreshold = 8 * 3600 * 1000;
            if (currentTime - lastSeenAt > noCommThreshold) {
                if(callback){
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

            return false;
        }

        vm.addListener = function () {
            vehicleService.addListener('rtgps2', vm.updateMarker2);
            newMapService.addListener('rtgps', vm.updateMarker);
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
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


        vm.customOverlay = function (marker) {
            if (!(marker.vehiclepath in vm.inCustomMaker)) {
                vm.inCustomMaker[marker.vehiclepath] = new customMapOverlay.CustomMarker(marker.latitude, marker.longitude,newMapService.inMap.map , {marker: marker});
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

            vm.inMap.map.addListener('click', function() {
                markerInfowindow.close();
                fenceInfowindow.close();
            });
        };

        vm.getMarkers = function (vehicleData) {
            if ( vm.markerByPath.hasOwnProperty(vehicleData.vehiclepath)){
                var markerPos = new google.maps.LatLng(vehicleData.latitude, vehicleData.longitude);
                vm.markerByPath[vehicleData.vehiclepath].setPosition(markerPos);
                vm.markerByPath[vehicleData.vehiclepath].setIcon(vehicleData.icon);
            }
        };

        vm.showMyPolygons = function () {
            for ( var i = 0; i < vm.inMap.polygons.length; i++ ) {
                var paths = [];
                for ( var j = 0; j < vm.inMap.polygons[i].path.length; j++ ) {
                    paths.push(new google.maps.LatLng(vm.inMap.polygons[i].path[j].latitude,
                        vm.inMap.polygons[i].path[j].longitude));
                }
                var polygon = new google.maps.Polygon({
                    path: paths,
                    strokeColor: vm.inMap.polygons[i].stroke.color,
                    strokeOpacity: 0.8,
                    strokeWeight: vm.inMap.polygons[i].stroke.weight,
                    fillColor: vm.inMap.polygons[i].fill.color,
                    fillOpacity: vm.inMap.polygons[i].fill.opacity,
                });
                polygon.setMap(vm.inMap.map);
            }
        };

        vm.showMyCircles = function () {
            for ( var i = 0; i < vm.inMap.circles.length; i++ ) {
                vm.inMap.circles.circleInfo = new google.maps.Circle({
                    strokeColor: vm.inMap.circles[i].stroke.color,
                    strokeOpacity: 0.8,
                    strokeWeight: vm.inMap.circles[i].stroke.weight,
                    fillColor: vm.inMap.circles[i].fill.color,
                    fillOpacity: vm.inMap.circles[i].fill.opacity,
                    center: {lat: vm.inMap.circles[i].center.latitude, lng: vm.inMap.circles[i].center.longitude},
                    radius: vm.inMap.circles[i].radius
                });
                vm.inMap.circles.circleInfo.setMap(vm.inMap.map);

                google.maps.event.addListener( vm.inMap.circles.circleInfo , 'click', function(e) {
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
            }
        };


        vm.onload = function () {
            $log.log('onload');
            $scope.$apply(function(){
                $compile(document.getElementById("markerWindow"))($scope);
            });
        };


        vm.showHistory = function () {
            $log.log("show History");
            newMapService.showHistory();
        };

        vm.init = function () {
            vm.loadMap();
            vm.addListener();
            geofenceViewService.getMyFences();
            //$interval(vm.runStats, 3000);
            $timeout(vm.runStats, 3000);

            setMapHeight();

            // vm.infoWindowCompiled = false;
            // vm.inMap.map.addListener('tilesloaded', function() {
            //     if(vm.infoWindowCompiled)
            //         return;
            //     vm.onload();
            // vm.infoWindowCompiled = true;
            // });
            markerInfowindow.addListener('domready', function() {
                $log.log("marker info window onload");
                vm.onload();
            });

            $interval(vm.resizeMap, 1000);

            vm.inMap.map.addListener('zoom_changed', function() {
                newMapService.setZoom( vm.inMap.map.getZoom());
            });
        };

        vm.resizeMap = function () {
            google.maps.event.trigger(vm.inMap.map, 'resize');
            return true;
        };


        vm.init();
    }

})();
