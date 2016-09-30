(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('HistoryController', HistoryController)
        .controller('ImmobalizeController', ImmobalizeController)
        .controller('InnerMapController', InnerMapController);

    function MapController($scope, $rootScope, $log, mapService,
                           $timeout, $mdDialog, $document, $interval,
                           rightNavAlertDashboardService, geofenceViewService,
                           historyService, dialogService) {
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
                        console.log('no place data :(');
                        return;
                    }

                    var gfmap = vm.inMap.mapControl.getGMap();

                    // $scope.map = {
                    //     "center": {
                    //         "latitude": place[0].geometry.location.lat(),
                    //         "longitude": place[0].geometry.location.lng()
                    //     },
                    //     "zoom": 18
                    // };
                    // $scope.marker = {
                    //     id: 0,
                    //     coords: {
                    //         latitude: place[0].geometry.location.lat(),
                    //         longitude: place[0].geometry.location.lng()
                    //     }
                    // };

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


        vm.inMap = {
            mapOptions: {},
            mapControl: {}
        };

        vm.inMarkers = [];
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


        vm.mapEvents = {
            click: function () {
                vm.infoWindowClose();
            },
            zoom_changed: function () {
                vm.changeMarkerIcon();
            }
        };
        var iconColor = 'orange';
        var zoomLevelIcon;
        vm.changeMarkerIcon = function () {
            vm.zoomMapZoom = vm.inMap.mapControl.getGMap().zoom;
            mapService.setZoom(vm.zoomMapZoom);

            for (var i = 0; i < vm.inMarkers.length; i++) {
                vm.inMarkers[i].icon = mapService.setMarkerIcon(vm.inMarkers[i]);
            }
        };


        function checkZoomLevel(min, max) {
            if (vm.zoomMapZoom <= max && vm.zoomMapZoom >= min) {
                return true;
            }
            return false;
        }


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


        vm.updateMarker = function (vehicleData) {
            //$log.log(msg);
            var isNewVehicle = true;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id === vehicleData.id) {
                    //vehicleData.options = vm.inMarkers[idx].options;
                    vm.inMarkers[idx] = vehicleData;
                    vm.inMarkers[idx].options = {visible: false};
                    isNewVehicle = false;
                    break;
                }
            }

            //$log.log(vehicleData);

            if (isNewVehicle) {
                vehicleData.options = {};
                vehicleData.options.animation = google.maps.Animation.BOUNCE;
                vm.inMarkers.push(vehicleData);
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }

            vm.runFilters(vm.filterStr);
        };


        vm.infoWindowClose = function () {
            //vm.infoWindow.control.hideWindow();
            vm.infoWindow.show = false;
        };


        vm.infoWindowShow = function () {
            //vm.infoWindow.control.showWindow();
            vm.infoWindow.show = true;
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


        vm.setMarkersVisible = function (flag) {
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                marker.options.visible = flag;
            }
        };


        vm.matchesAnyMarkerData = function (marker, searchStr) {
            for (var eachidx in marker) {
                if (vm.excludeFilters.indexOf(eachidx) != -1)
                    continue;

                var lowercaseSearchStr = searchStr.toString().toLowerCase();
                var lowercaseMarkerStr = marker[eachidx].toString().toLowerCase();

                //$log.log(lowercaseSearchStr + " = " + lowercaseMarkerStr);
                if (lowercaseMarkerStr.includes(lowercaseSearchStr)) {
                    return true;
                }
            }

            //$log.log("not matching " + marker.id);
            return false;
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
            if (marker.meta.onroad) {
                if (vm.onRoaded) {
                    return true;
                }
            } else {
                if (vm.offRoaded) {
                    return true;
                }
            }

            // $log.log("false");
            return false;
        };


        vm.runFilters = function (filterStr) {
            //$log.log("runFilters");

            if (vm.filterStr !== filterStr)
                vm.infoWindowClose();

            vm.filterStr = filterStr;


            var filtered = 0;
            var matchedIdx = 0;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (!vm.matchesAnyMarkerData(marker, filterStr)) {
                    //$log.log(marker);
                    marker.options.visible = false;

                } else {
                    marker.options.visible = true;
                    filtered++;
                    matchedIdx = idx;
                }

                marker.options.visible = vm.checkRoaded(marker) && marker.options.visible;
            }

            // if at least one marker matched the filter string
            if (matchedIdx) {
                // vm.inMap.center = vm.getMarkerCenter(vm.inMarkers[matchedIdx]);
            }

            // $log.log("Filtered vehicles = " + filtered);
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
            // $mdDialog.show({
            //     controller: 'DialogController as vm',
            //     templateUrl: 'app/components/landingpage/dashboard/map/history-dialog.html',
            //     parent: angular.element(document.body),
            //     clickOutsideToClose: true,
            //     escapeToClose: false,
            //     locals: {
            //         params: {
            //             clickedMarker: vm.clickedMarker,
            //             mainMarkers: vm.inMarkers
            //         }
            //     }
            // });
            dialogService.show('home.history', {
                clickedMarker: vm.clickedMarker,
                mainMarkers: vm.inMarkers
            });
        };

        vm.immobalize = function (status) {
            var immobalizeDialog = $mdDialog.confirm({
                controller: 'ImmobalizeController',
                templateUrl: 'app/components/landingpage/dashboard/map/immobalize-dialog.html',
                clickOutsideToClose: false,
                escapeToClose: false
            })
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(immobalizeDialog)
                .then(function () {
                    $log.log("Yes Function");
                }, function () {
                    $log.log("No Function");
                })
        };


        vm.cancelImmobalize = function () {
            $mdDialog.cancel();
        };


        vm.geoFilters = {
            showAll: true,
            parkingLot: true,
            lowBattery: false,
            serviceStation: true,
            competitorHub: true,
            cityLimits: false,
        };

        geofenceViewService.setData('geoFilters', vm.geoFilters);

        vm.getMyFencesListener = function (fences) {
            vm.circles = fences.circles;
            $log.log(vm.circles);
            vm.polygons = fences.polygons;
            vm.applyFilters({filters:vm.geoFilters,updates: vm.geoFilters});
            geofenceViewService.setData('geofences', true);
            $log.log(fences);
        };


        vm.applyFilters = function (filterData) {
            var filters = filterData.filters;
            var update = filterData.update;
            vm.geoFilters = filters;
            if (vm.circles && vm.polygons) {
                for (var i = 0; i < vm.circles.length; i++) {
                    var filterStr = vm.circles[i].info.tagdata;
                    if (checkFilterString(filters, filterStr)) {
                        vm.circles[i].visible = true;
                        vm.circles[i].stroke.weight = getStroke(filterStr);
                        vm.circles[i].stroke.color = getColor(filterStr);
                        startAnimation(vm.circles[i]);
                    } else {
                        vm.circles[i].visible = false;
                    }
                }
                for (var i = 0; i < vm.polygons.length; i++) {
                    var filterStr = vm.polygons[i].info.tagdata;
                    if (checkFilterString(filters, filterStr)) {
                        vm.polygons[i].visible = true;
                        vm.polygons[i].stroke.weight = getStroke(filterStr);
                        vm.polygons[i].stroke.color = getColor(filterStr);
                        startAnimation(vm.polygons[i]);
                    } else {
                        vm.polygons[i].visible = false;
                    }
                }
                if (filters.lowBattery) {
                    // do some code to add low battery
                } else {
                    // do some code to remove low battery
                }
            }
        };

        var PARKING = 'parking';
        var SERVICE_STATION = 'service';
        var COMPETITOR_HUB = 'competitor';
        var CITY_LIMIT = 'citylimits';

        var DEFAULT_STROKE = 10;
        var MIN_STROKE = 3;

        function getColor(str) {
            var type = getType(str);
            if (type == PARKING) {
                return '#2ecc71';
            } else if (type == SERVICE_STATION) {
                return '#f89406';
            } else if (type == COMPETITOR_HUB) {
                return '#d35400';
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
            if (getType(obj.info.tagdata) != CITY_LIMIT) {
                $interval(function () {
                    count++;
                    if (count % 2 == 0)
                        obj.stroke.weight = DEFAULT_STROKE;
                    else
                        obj.stroke.weight = MIN_STROKE;

                }, 500, 6);
            }
        }

        function getType(str) {
            if (str.match(/parking/g) && str.match(/parking/g).length > 0) {
                return 'parking';
            } else if (str.match(/servicestation/g) && str.match(/servicestation/g).length > 0) {
                return 'service';
            } else if (str.match(/competitor/g) && str.match(/competitor/g).length > 0) {
                return 'competitor';
            } else if (str.match(/citylimit/g) && str.match(/citylimit/g).length > 0) {
                return 'citylimits';
            }
        }

        function checkFilterString(filter, str) {
            if (filter.competitorsHub && str.match(/competitor/g) && str.match(/competitor/g).length > 0 ||
                filter.parkingLot && str.match(/parking/g) && str.match(/parking/g).length > 0 ||
                filter.cityLimits && str.match(/citylimit/g) && str.match(/citylimit/g).length > 0 ||
                filter.serviceStation && str.match(/servicestation/g) && str.match(/servicestation/g).length > 0) {
                return true;
            }
            return false;
        };


        vm.polygonClickListener = function(polygon, eventName, model, args){
            $log.log('polygon clicked');
            $log.log(model);
            $log.log(polygon);
            $log.log(args);
            //vm.infoWindowShow();
        };


        vm.circleClickListener = function(circle, eventName, model, args) {
            $log.log('circle clicked');
            $log.log(model);
            $log.log(circle);
            $log.log(args);
            //vm.infoWindowShow();
        };


        vm.addListener = function () {
            mapService.addListener('rtgps', vm.updateMarker);
            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
            geofenceViewService.addListener('applyFilters', vm.applyFilters);
            geofenceViewService.addListener('polygonClickListener', vm.polygonClickListener);
            geofenceViewService.addListener('circleClickListener', vm.circleClickListener);
        };


        vm.init = function () {
            vm.loadMap();
            historyService.setData('inMarkers', vm.inMarkers);
            vm.addListener();
            geofenceViewService.getMyFences();
        };

        vm.init();
    }


    //#################################################################################################################


    function HistoryController($scope, $log, $mdDialog, mapService, $state, dialogService,
                               $interval, intellicarAPI, historyService, $timeout, geofenceViewService) {
        $log.log('HistoryController');

        var vm = this;
        dialogService.setTab(0);
        params = dialogService.getData('historyData');
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
                $scope.historyMap.center = $scope.clickedMarker;
                $scope.deviceid = $scope.clickedMarker.deviceid;
                $scope.vehicleNumber = $scope.clickedMarker.vehicleno;
                $scope.errorMsg = "";
                console.log($scope.deviceid + ' <<<');
            }
            $scope.clickedMarker.trace = $scope.trace;
        };


        $scope.onVehicleSelect = function () {
            console.log("onVehicleSelect");
            console.log($scope.deviceid);
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


        $scope.historyInfoWindow = {
            show: false,
            coords: $scope.clickedMarker,
            control: {},
            options: {
                //maxWidth: 300,
                disableAutoPan: false,
                pixelOffset: {
                    width: 0,
                    height: -25
                }
            },
            data: {}
        };

        historyService.setData('historyMap', $scope.historyMap);
        historyService.setData('historyInfoWindow', $scope.historyInfoWindow);


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
        var hrs6 = 21600 * MILLISEC;
        var hrs3 = 10800 * MILLISEC;
        var hrs8 = 28800 * MILLISEC;
        var hrs12 = 43200 * MILLISEC;
        var hrs24 = 86400 * MILLISEC;
        var hrs48 = hrs24 * 2;
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

            $log.log(resp);

            $scope.trace.path = [];

            for (var idx in resp.data.data) {
                var position = resp.data.data[idx];
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


                var midPoint = Math.floor($scope.trace.path.length / 2);
                $scope.historyMap.center = $scope.trace.path[midPoint];
                $scope.historyMap.zoom = 11;

                // $scope.historyInfoWindow.coords = $scope.clickedMarker;
                // $scope.historyInfoWindow.data.gpstime = new Date($scope.trace.path[0].gpstime);
                // $scope.historyInfoWindow.data.odometer = $scope.trace.path[0].odometer;
                // $scope.historyInfoWindow.data.speed = $scope.trace.path[0].speed;
                // $scope.historyInfoWindow.show = true;
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


        vm.getMyFencesListener = function (fences) {
            vm.circles = fences.circles;
            vm.polygons = fences.polygons;
            //$log.log("In map.controller");
            $log.log(fences);
        };


        vm.init();
        $interval($scope.resizeMap, 500);
        historyService.setData('clickedMarker', $scope.clickedMarker);
        geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
    }


    //#################################################################################################################


    function ImmobalizeController($scope, $log, $mdDialog) {

        //var vm = this;
        $log.log('ImmobalizeController');
        $scope.cancelImmobalize = function () {
            $log.log('cancelImmobalize');
            $mdDialog.cancel();
        };

        $scope.okImmobilize = function () {
            $log.log('okImmobilize');
            $mdDialog.cancel();
        }
    }


    //#################################################################################################################


    function InnerMapController($scope, $log, $mdToast, historyService, $interval) {
        $log.log('InnerMapController');
        var marker = historyService.getData('clickedMarker');
        var historyMap = historyService.getData('historyMap');
        var historyInfoWindow = historyService.getData('historyInfoWindow');
        var timeIncreaseBy = 120000;
        var initialTime;
        var tracePoint;
        var animationCount = 0;

        $log.log(marker);

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

            initialTime = path[animationCount].gpstime;
            updateTracePoint(path[animationCount]);
        };

        $scope.setSliderTime = function () {
            if (marker && !marker.trace.path.length)
                return;

            $scope.initialSliderTime = 0;
            var initialTime = new Date(marker.trace.path[0].gpstime);

            $scope.finalSliderTime = (marker.trace.path[marker.trace.path.length - 1].gpstime -
                marker.trace.path[0].gpstime ) / 1000;

            $log.log(marker.trace.path[marker.trace.path.length - 1].gpstime);
            $log.log("slider time = " + $scope.finalSliderTime);

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
            $log.log("jump slider to " + $scope.sliderTime);

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
            $scope.sliderPoint = 0;
            //$scope.sliderPoint = 1;
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
            if (marker)
                $log.log(marker);
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
