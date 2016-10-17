(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('HistoryController', HistoryController)
        .controller('ImmobalizeController', ImmobalizeController)
        .controller('InnerMapController', InnerMapController);

    function MapController($scope, $log, mapService,
                           $mdDialog, $interval, geofenceViewService,$timeout,customMapOverlay,
                           historyService, dialogService, vehicleService) {
        $log.log('MapController');
        var vm = this;
        vm.circles = [];
        vm.polygons = [];

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
        vm.inMarkers = mapService.getMainMarkers();
        vm.doRebuildAll = false;
        vm.modelsbyref = false;
        vm.clickedMarker = {};

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
                    immoblize: vm.immobalize,
                    showHistory: vm.showHistory
                };

                vm.infoWindowShow();
            }
        };


        vm.onRoaded = true;
        vm.offRoaded = false;


        vm.loadMap = function () {
            vm.inMap.zoom = mapService.getZoom();
            vm.inMap.center = mapService.getCenter();
            vm.inMap.bounds = mapService.getBounds();
        };


        vm.infoWindowClose = function () {
            //vm.infoWindow.control.hideWindow();
            vm.infoWindow.show = false;
        };


        vm.infoWindowShow = function () {
            //vm.infoWindow.control.showWindow();
            vm.infoWindow.show = true;
        };

        vm.fenceInfoWindowClose = function () {
            //vm.infoWindow.control.hideWindow();
            vm.fenceInfoWindow.show = false;
        };


        vm.fenceInfoWindowShow = function () {
            //vm.infoWindow.control.showWindow();
            vm.fenceInfoWindow.show = true;
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


        vm.updateMarker2 = function (vehicleData) {
            //$log.log('updateMarker2');
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
                if(vm.inCustomMaker[marker.vehiclepath]){
                    vm.inCustomMaker[marker.vehiclepath].hide();
                }
            } else {
                marker.options.visible = true;
                if(vm.inCustomMaker[marker.vehiclepath]){
                    vm.inCustomMaker[marker.vehiclepath].show();
                }
            }

            marker.options.visible = vm.checkRoaded(marker) && marker.options.visible;
            if(vm.inCustomMaker[marker.vehiclepath]){
                if(vm.checkRoaded(marker) && marker.options.visible){
                    vm.inCustomMaker[marker.vehiclepath].show();
                }else{
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

        $interval(vm.runStats, 3000);


        vm.showHistory = function () {
            //$log.log(vm.clickedMarker);
            vm.selectedTab = 0;
            historyService.setData('selectedTab', vm.selectedTab);
            dialogService.show('home.history', {
                clickedMarker: vm.clickedMarker,
                mainMarkers: vm.inMarkers
            });
        };

        vm.immobalize = function (status) {
            var immobalizeDialog = $mdDialog.confirm({
                controller: 'ImmobalizeController',
                templateUrl: 'app/components/landingpage/dashboard/map/immobalize-dialog.html',
                clickOutsideToClose: true,
                escapeToClose: true,
                locals: {
                    params: {
                        clickedMarker: vm.clickedMarker
                    }
                }
            }).ok('Yes').cancel('No');

            $mdDialog.show(immobalizeDialog)
                .then(function () {
                    //$log.log("Yes Function");
                    // console.log(immobalizeDialog);
                }, function () {
                    //$log.log("No Function");
                })
        };


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
            vm.circles = fences.circles;
            vm.polygons = fences.polygons;
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
                if (vm.circles) {
                    for (idx = 0; idx < vm.circles.length; idx++) {
                        var filterStr = vm.circles[idx].control.info.tagdata;
                        // $log.log(filterData.filterType + ", checkfilterstr = " + checkFilterString(filterStr));
                        if (checkFilterString(filterStr)) {
                            vm.circles[idx].visible = true;
                            vm.circles[idx].stroke.weight = getStroke(filterStr);
                            vm.circles[idx].stroke.color = getColor(filterStr);
                            startAnimation(vm.circles[idx]);
                        } else {
                            vm.circles[idx].visible = false;
                        }
                    }
                }

                if (vm.polygons) {
                    for (idx = 0; idx < vm.polygons.length; idx++) {
                        filterStr = vm.polygons[idx].control.info.tagdata;
                        // $log.log(filterData.filterType + ", checkfilterstr = " + checkFilterString(filterStr));
                        if (checkFilterString(filterStr)) {
                            vm.polygons[idx].visible = true;
                            vm.polygons[idx].stroke.weight = getStroke(filterStr);
                            vm.polygons[idx].stroke.color = getColor(filterStr);
                            startAnimation(vm.polygons[idx]);
                        } else {
                            vm.polygons[idx].visible = false;
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

        vm.circleEvents = {
            click: function (circle, eventName, model, args) {
                //$log.log('Circle clicked');

                vm.fenceObj = {
                    'latitude': model.center.latitude,
                    'longitude': model.center.longitude
                };

                vm.fenceDetails = {
                    name: model.control.info.name,
                    other: model.control.info.tagdata
                };

                vm.fenceInfoWindowShow();
            }
        };

        vm.polygonEvents = {
            click: function (polygon, eventName, model, args) {
                //$log.log('polygon clicked');

                var polygonCenter = vm.getPolygonMidPoint(model.path);

                vm.fenceObj = {
                    'latitude': polygonCenter.lat(),
                    'longitude': polygonCenter.lng()
                };

                vm.fenceDetails = {
                    name: model.control.info.name,
                    other: model.control.info.tagdata
                };

                vm.fenceInfoWindowShow();
            }
        };


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

        vm.init = function () {
            vm.loadMap();
            historyService.setData('inMarkers', vm.inMarkers);
            vm.addListener();
            geofenceViewService.getMyFences();
        };

        vm.init();


        // Google Map Custom HTML Marker

        var firstLoad = true;
        var inGmap;
        vm.inCustomMaker = {};

        vm.customOverlay = function(marker){
            if(!vm.inCustomMaker[marker.vehiclepath]) {
                if (firstLoad) {
                    $timeout(function () {
                        inGmap = vm.inMap.mapControl.getGMap();
                        vm.inCustomMaker[marker.vehiclepath] = new customMapOverlay.CustomMarker(marker.latitude, marker.longitude, inGmap, {marker:marker});
                        firstLoad = false;
                    }, 2000);
                } else {
                    vm.inCustomMaker[marker.vehiclepath] = new customMapOverlay.CustomMarker(marker.latitude, marker.longitude, inGmap, {marker:marker});
                }
            }
        };

        vm.showVehicleNumber = false;

        vm.showVehicleNumber = function (vn) {
            vm.vehicleNumber = vn;
            if(vm.vehicleNumber){
                for(idx in vm.inCustomMaker){
                   vm.inCustomMaker[idx].showVehicleNumber();
                }
            }else{
                for(idx in vm.inCustomMaker){
                    vm.inCustomMaker[idx].hideVehicleNumber();
                }
            }
        };

    }


    //#################################################################################################################


    function HistoryController($scope, $log, $mdDialog, mapService, dialogService,
                               $interval, intellicarAPI, historyService, geofenceViewService) {
        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(0);
        var params = dialogService.getData('historyData');
        var selectedVehicle = dialogService.getData('selectedVehicle');

        vm.multiSelect = true;
        vm.circles = [];
        vm.polygons = [];

        $scope.historyMap = {
            mapOptions: {},
            mapControl: {}
        };

        var initialZoom = mapService.getZoom();

        $scope.inMarkers = angular.copy(historyService.getData('inMarkers'));


        $scope.onVehicleSelect = function () {
            // console.log("onVehicleSelect");
            // console.log($scope.deviceid);
        };

        //$log.log("uiGmapGoogleMapApi loaded");
        $scope.trace = {
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
        };


        // $scope.historyInfoWindow = {
        //     show: false,
        //     coords: $scope.endMarker,
        //     control: {},
        //     options: {
        //         //maxWidth: 300,
        //         disableAutoPan: false,
        //         pixelOffset: {
        //             width: 0,
        //             height: -25
        //         }
        //     },
        //     data: {}
        // };

        $scope.endMarker = {
            options: {},
            events: {
                // click: function (marker, eventName, model, args) {
                //     $scope.historyInfoWindow.show = true;
                // }
            },
            // click: function (marker, eventName, model, args) {
            //     $scope.historyInfoWindow.show = true;
            // }
        };


        historyService.setData('historyMap', $scope.historyMap);
        //historyService.setData('historyInfoWindow', $scope.historyInfoWindow);

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.resizeMap = function () {
            google.maps.event.trigger($scope.historyMap.mapControl.getGMap(), 'resize');
            return true;
        };

        //var dateFormat = 'YYYY-MM-DD HH:mm';
        var dateFormat = 'YYYY/MM/DD HH:mm';
        $scope.startTime = moment().subtract(24, 'hour').format(dateFormat);
        $scope.endTime = moment().format(dateFormat);

        var MILLISEC = 1000;
        // var hrs6 = 21600 * MILLISEC;
        // var hrs3 = 10800 * MILLISEC;
        // var hrs8 = 28800 * MILLISEC;
        // var hrs12 = 43200 * MILLISEC;
        var hrs24 = 86400 * MILLISEC;
        // var hrs48 = hrs24 * 2;
        var week = hrs24 * 7;
        var timeLimit = week;


        $scope.getHistory = function () {
            historyService.setData('getHistory', false);
            if ($scope.startTime && $scope.endTime) {
                if ($scope.startTime.length && $scope.endTime.length) {

                    // $log.log($scope.startTime);
                    // $log.log($scope.endTime);

                    // var starttime = moment($scope.startTime).format(dateFormat);
                    // var endtime = moment($scope.endTime).format(dateFormat);

                    var starttime = new Date($scope.startTime).getTime();
                    var endtime = new Date($scope.endTime).getTime();

                    if (endtime - starttime > timeLimit)
                        endtime = starttime + timeLimit;

                    // $log.log(starttime);
                    // $log.log(endtime);

                    if (endtime <= starttime) {
                        $scope.errorMsg = "End time should be >= Start time";
                        return;
                    }

                    var body = {
                        vehicle: {
                            vehiclepath: $scope.deviceid.toString(),
                            starttime: starttime,
                            endtime: endtime
                        }
                    };

                    intellicarAPI.reportService.getDeviceLocation(body)
                        .then($scope.drawTrace, $scope.handleGetLocationFailure);


                } else {
                    $scope.errorMsg = "Enter valid start and end time";
                    return;
                }
            } else {
                $scope.errorMsg = "Enter valid start and end time.";
                return;
            }
        };


        $scope.drawTrace = function (resp) {
            //$log.log(resp);

            var traceData = resp.data.data;
            var path = $scope.trace.path;
            $scope.trace.path = [];


            for (var idx in traceData) {
                var position = traceData[idx];
                if (position.latitude.constructor !== Number || position.longitude.constructor !== Number) {
                    $log.log("Not a number");
                    $log.log(position);
                    continue;
                }
                position.id = $scope.deviceid;
                position.gpstime = parseInt(position.gpstime);
                position.odometer = position.odometer;
                position.speed = parseInt(position.speed.toFixed(2));
                $scope.trace.path.push(position);
            }

            function compare(a, b) {
                return a.gpstime - b.gpstime;
            }

            $scope.trace.path.sort(compare);


            if ($scope.trace.path.length) {
                historyService.setData('getHistory', true);
                $scope.clickedMarker.latitude = $scope.trace.path[0].latitude;
                $scope.clickedMarker.longitude = $scope.trace.path[0].longitude;
                $scope.clickedMarker.options.icon = 'assets/images/markers/big/red-dot.png';


                var midPoint = Math.floor($scope.trace.path.length / 2);
                $scope.historyMap.center.latitude = $scope.trace.path[midPoint].latitude;
                $scope.historyMap.center.longitude = $scope.trace.path[midPoint].longitude;
                $scope.historyMap.zoom = 11;

                var lastBeacon = $scope.trace.path[$scope.trace.path.length - 1];
                $scope.endMarker.latitude = lastBeacon.latitude;
                $scope.endMarker.options.label = 'E';
                $scope.endMarker.longitude = lastBeacon.longitude;
                //$scope.endMarker.options.icon = 'assets/images/markers/big/red.png';
                $scope.endMarker.options.title = 'End point';


                // $scope.historyInfoWindow.coords = $scope.endMarker;
                // $scope.historyInfoWindow.data.gpstime = new Date(lastBeacon.gpstime);
                // $scope.historyInfoWindow.data.odometer = lastBeacon.odometer;
                // $scope.historyInfoWindow.data.speed = lastBeacon.speed;
                //$scope.historyInfoWindow.show = true;

                $scope.errorMsg = '';
                $scope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true});
            } else {
                $scope.errorMsg = "No Data Found";
            }
        };


        $scope.fitBounds = function () {
            $scope.trace.fit = true;
        };


        $scope.handleGetLocationFailure = function (resp) {
            $log.log("handleGetLocationFailure");
            $log.log(resp);
            $scope.trace.path = [];
        };


        $scope.getClickedMarker = function () {
            return $scope.clickedMarker;
        };


        vm.getMyFencesListener = function () {
            //$log.log("getMyFencesListener");
            vm.fences = geofenceViewService.getToDrawFences();
            vm.circles = vm.fences.circles;
            vm.polygons = vm.fences.polygons;
            //$log.log(vm.fences);
        };


        vm.init = function () {
            $scope.historyMap.zoom = initialZoom;
            $scope.historyMap.center = mapService.getCenter();
            if (params == null) {
                $scope.clickedMarker = {};
                if (angular.isDefined(selectedVehicle)) {
                    $scope.deviceid = selectedVehicle.deviceid;
                    $scope.vehicleNumber = selectedVehicle.vehicleNumber;
                    vm.multiSelect = false;
                } else {
                    vm.multiSelect = true;
                    $scope.deviceid = 'Select Vehicle';
                    $scope.vehicleNumber = 'Select Vehicle';
                }
            } else {
                $scope.clickedMarker = angular.copy(params.clickedMarker);
                $scope.clickedMarker.options.animation = null;
                $scope.historyMap.center = $scope.clickedMarker;
                $scope.deviceid = $scope.clickedMarker.deviceid;
                $scope.vehicleNumber = $scope.clickedMarker.vehicleno;
                $scope.errorMsg = "";
            }

            if ($scope.inMarkers.length)
                $scope.clickedMarker = $scope.inMarkers[0];
            $scope.clickedMarker.trace = $scope.trace;
            vm.getMyFencesListener();
        };


        geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
        vm.init();
        historyService.setData('clickedMarker', $scope.clickedMarker);
        $interval($scope.resizeMap, 500);
    }


    //#################################################################################################################


    function ImmobalizeController($scope, $log, $timeout, $mdDialog, params, intellicarAPI) {
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
            if(!params.clickedMarker.ignitionstatus) {
                $scope.msg = params.clickedMarker.mobilistatus ? "Vehicle immobilized" : "Vehicle mobilized";
            } else {
                var state = params.clickedMarker.mobilistatus ? "immobilized" : "mobilized";
                $scope.msg = 'Command received.';
                $scope.notify = 'Vehicle in sleep state. Vehicle will be ' + state + ' when it wakes up.';
            }
            $scope.closeDialog();
        };


        $scope.failure = function (resp) {
            //$log.log("failure");
            //$log.log(resp);
            if (resp.status == 403) {
                $scope.msg = "You are unauthorized to perform this operation";
                $scope.closeDialog();
            }
        };


        $scope.closeDialog = function () {
            $timeout($mdDialog.cancel, 3000);
        };


        $scope.okImmobilize = function () {
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
            $scope.msg = params.clickedMarker.mobilistatus ? "Immobilize ?" : "Mobilize ?";
        };


        $scope.init();
    }


    //#################################################################################################################


    function InnerMapController($scope, $log, $mdToast, historyService, $interval) {
        $log.log('InnerMapController');
        var marker = historyService.getData('clickedMarker');
        var historyMap = historyService.getData('historyMap');
        //var historyInfoWindow = historyService.getData('historyInfoWindow');
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
            // historyInfoWindow.data.odometer = tracePoint.odometer;
            // historyInfoWindow.data.speed = tracePoint.speed;
            // historyInfoWindow.data.gpstime = tracePoint.gpstime;
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
