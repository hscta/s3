(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('HistoryController', HistoryController)
        .controller('ImmobalizeController', ImmobalizeController)
        .controller('InnerMapController', InnerMapController)

    function MapController($scope, $rootScope, $log, mapService,
                           $timeout, $mdDialog, $document, $interval,
                           rightNavAlertDashboardService,MapLeftToolBarService) {
        $log.log('MapController');
        var vm = this;

        vm.leftToolbar = MapLeftToolBarService.toolbar;

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
            zoom: function () {
                console.log('map scrolling');
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


        vm.updateZoom = function () {
            vm.inMap.zoom = mapService.getZoom();
            $timeout(vm.updateZoom, 4000);
        };


        vm.updateMarker = function (vehicleData) {
            //$log.log(msg);
            var isNewVehicle = true;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id == vehicleData.id) {
                    // if (Math.abs(marker.latitude - vehicleData.latitude) > 0.03 ||
                    //     Math.abs(marker.longitude - vehicleData.longitude) > 0.03) {
                    //     $log.log(marker.id + ": previous location: " + new Date(marker.timestamp) +
                    //         ", " + marker.latitude + ", " + marker.longitude);
                    //     $log.log(marker.id + ": current  location: " + new Date(vehicleData.timestamp) +
                    //         ", " + vehicleData.latitude + ", " + vehicleData.longitude);
                    // }

                    vehicleData.options = vm.inMarkers[idx].options;
                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                }
            }

            //$log.log(vehicleData);

            if (isNewVehicle) {
                vehicleData.options = {};
                vm.inMarkers.push(vehicleData);
                vm.runFilters(vm.filterStr);
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }
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
            //vm.inMap.center = {latitude: vm.clickedMarker.latitude + 0.05, longitude: vm.clickedMarker.longitude};
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


            // if (filterStr.length === 0) {
            //     vm.setMarkersVisible(true);
            //     return;
            // }

            vm.filterStr = filterStr;
            vm.infoWindowClose();

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
                // if (filtered == vm.inMarkers.length) {
                //     matchedIdx = Math.floor(filtered / 2);
                // }
                vm.inMap.center = vm.getMarkerCenter(vm.inMarkers[matchedIdx]);
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
            MapLeftToolBarService.dialogTab = 0;
            $mdDialog.show({
                controller: 'HistoryController as vm',
                templateUrl: 'app/components/landingpage/dashboard/map/history-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                escapeToClose: false,
                locals: {
                    params: {
                        clickedMarker: vm.clickedMarker,
                        mainMarkers: vm.inMarkers
                    }
                }
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
            //$log.log('cancel dialog');
            $mdDialog.cancel();
        };


        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
            rightNavAlertDashboardService.addListener(vm.alertClick);
        };


        vm.loadMap();
        vm.addListener();
    }


    function HistoryController($scope, $log, $mdDialog, mapService,
                               $interval, params, intellicarAPI, historyService, MapLeftToolBarService) {
        //var vm = this;
        //$log.log($scope);
        var vm = this;
        vm.selectedTab = MapLeftToolBarService.dialogTab;

        $log.log('HistoryController');

        $scope.historyMap = {
            mapOptions: {},
            mapControl: {}
        };

        var initialZoom = mapService.getZoom();
        $scope.historyMap.zoom = initialZoom;
        $scope.clickedMarker = angular.copy(params.clickedMarker);
        $scope.historyMap.center = $scope.clickedMarker;
        $scope.deviceid = $scope.clickedMarker.deviceid;
        $scope.vehicleNumber = $scope.clickedMarker.title;
        $scope.errorMsg = "";


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

        $scope.clickedMarker.trace = $scope.trace;

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
        var hrs48 = (hrs24 + 1) * 2;
        var timeLimit = hrs48;


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
                $scope.historyMap.zoom = 10;

                $scope.historyInfoWindow.coords = $scope.clickedMarker;
                $scope.historyInfoWindow.data.gpstime = new Date($scope.trace.path[0].gpstime);
                $scope.historyInfoWindow.data.odometer = $scope.trace.path[0].odometer;
                $scope.historyInfoWindow.data.speed = $scope.trace.path[0].speed;
                $scope.historyInfoWindow.show = true;
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

        $scope.getMyVehicles = function () {
            intellicarAPI.userService.getMyVehiclesMap({})
                .then(function (resp) {
                    $log.log(resp);
                    $scope.vehicles = resp;
                }, function (resp) {
                    $log.log("handleMyVehiclesFailure");
                    $log.log(resp);
                });
        };

        $scope.getMyVehicles();

        historyService.setData('clickedMarker', $scope.clickedMarker);
        $interval($scope.resizeMap, 500);
    }


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

    function InnerMapController($scope, $log, $mdToast, historyService, $interval) {

        var marker = historyService.getData('clickedMarker');
        var historyMap = historyService.getData('historyMap');
        var historyInfoWindow = historyService.getData('historyInfoWindow');
        var timeIncreaseBy = 120000;
        var initialTime;
        var tracePoint;
        var animationCount = 0;

        $scope.play = true;
        $scope.ffrate = 1;

        $scope.traceRoute = function () {
            if (marker.trace.path.length && $scope.gotHistory()) {
                initialTime = marker.trace.path[animationCount].gpstime;
                $scope.animateMarker = $interval(function () {
                    initialTime += (timeIncreaseBy * $scope.ffrate);
                    while (animationCount < marker.trace.path.length) {
                        tracePoint = marker.trace.path[animationCount];
                        if (tracePoint.gpstime <= initialTime) {
                            marker.latitude = tracePoint.latitude;
                            marker.longitude = tracePoint.longitude;
                            //$scope.sliderPoint = animationCount;
                            historyInfoWindow.data.gpstime = tracePoint.gpstime;
                            historyInfoWindow.data.odometer = tracePoint.odometer;
                            historyInfoWindow.data.speed = tracePoint.speed;
                            moveMapWithMarker(marker);
                            animationCount++;
                        } else {
                            break;
                        }
                    }

                    if (animationCount >= marker.trace.path.length || !$scope.gotHistory()) {
                        $scope.stopAnimation();
                    }

                }, 100);
            }
        };


        $scope.fastForward = function () {
            if ($scope.ffrate < 128) {
                $scope.ffrate *= 2;
            }
            //$log.log("ffrate " + $scope.ffrate);
            //$scope.getAnimationRate();
        };


        $scope.goSlow = function () {
            if ($scope.ffrate > (1 / 128)) {
                $scope.ffrate /= 2;
            }
            //$log.log("ffrate " + $scope.ffrate);
            //$scope.getAnimationRate();
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
            $interval.cancel($scope.animateMarker);
            animationCount = 0;
            $scope.play = true;
            //$scope.sliderPoint = 1;

            if (marker.trace.path.length > 0) {
                marker.latitude = marker.trace.path[animationCount].latitude;
                marker.longitude = marker.trace.path[animationCount].longitude;
            }
        };


        $scope.$on('$destroy', function () {
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
