(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('HistoryController', HistoryController)
        .controller('ImmobalizeController', ImmobalizeController)
        .controller('InnerMapController', InnerMapController);

    function MapController($scope, $rootScope, $log, mapService,
                           $timeout, $mdDialog, $document, $interval,
                           rightNavAlertDashboardService, MapLeftToolBarService, historyService, dialogService) {
        $log.log('MapController');
        var vm = this;


        $scope.circleFence = {
            "fencetype":"circle",
            "fencecenter":{"lat":19.196051,"lng":72.961938},
            "fenceradius":30
        };

        vm.circles = [
            {
                id: 1,
                center: {
                    latitude: 19.196051,
                    longitude: 72.961938
                },
                radius: 30,
                stroke: {
                    color: '#08B21F',
                    weight: 2,
                    opacity: 1
                },
                fill: {
                    color: '#08B21F',
                    opacity: 0.5
                },
                geodesic: true, // optional: defaults to false
                draggable: false, // optional: defaults to false
                clickable: true, // optional: defaults to true
                editable: true, // optional: defaults to false
                visible: true, // optional: defaults to true
                control: {}
            }
        ];


        // var polygons = {
        //     "fencetype":"polygon",
        //     "vertex":[{"lat":19.088451,"lng":72.895935},
        //         {"lat":19.088409,"lng":72.89637},
        //         {"lat":19.088088,"lng":72.896356},
        //         {"lat":19.088143,"lng":72.895833},
        //         {"lat":19.088451,"lng":72.895935}]
        // }"

        vm.polygons = [
            {
                id: 1,
                path: [
                    {"latitude":19.088451,"longitude":72.895935},
                    {"latitude":19.088409,"longitude":72.89637},
                    {"latitude":19.088088,"longitude":72.896356},
                    {"latitude":19.088143,"longitude":72.895833},
                    {"latitude":19.088451,"longitude":72.895935}
                ],
                stroke: {
                    color: '#08B21F',
                    weight: 3
                },
                editable: false,
                draggable: false,
                geodesic: false,
                visible: true,
                fill: {
                    color: '#08B21F',
                    opacity: 0.5
                }
            }
        ];



        // var infowindowplacesearch = new google.maps.InfoWindow();


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
        }

//gfmap.controls[google.maps.ControlPosition.TOP_LEFT].push(input)

// console.log(google.maps.places);

// var autocomplete = new google.maps.places.Autocomplete(input);
// autocomplete.bindTo('bounds', gfmap);

// autocomplete.addListener('place_changed', function() {
//     infowindowplacesearch.close();
//     //marker.setVisible(false);
//     var place = autocomplete.getPlace();
//     if (!place.geometry) {
//     window.alert("Autocomplete's returned place contains no geometry");
//     return;
//     }

//     // If the place has a geometry, then present it on a map.
//     if (place.geometry.viewport) {
//     gfmap.fitBounds(place.geometry.viewport);
//     } else {
//     gfmap.setCenter(place.geometry.location);
//     gfmap.setZoom(17);  // Why 17? Because it looks good.
//     }

//     var address = '';
//     if (place.address_components) {
//     address = [
//       (place.address_components[0] && place.address_components[0].short_name || ''),
//       (place.address_components[1] && place.address_components[1].short_name || ''),
//       (place.address_components[2] && place.address_components[2].short_name || '')
//     ].join(' ');
//     }

//     infowindowplacesearch.setContent('<div><strong>' + place.name + '</strong><br>' + address);
//     infowindowplacesearch.setPosition(place.geometry.location);
//     infowindowplacesearch.open(gfmap);
//     $timeout(function(){infowindowplacesearch.close()}, 2000);
// });


        vm.leftToolbar = function () {
            return MapLeftToolBarService.getToolbarVar();
        }

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
        }

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

// vm.markerOptions = {
//     animation:false;
// }


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
            //$log.log('cancel dialog');
            $mdDialog.cancel();
        };


        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
            rightNavAlertDashboardService.addListener(vm.alertClick);
        };


        vm.loadMap();
        vm.addListener();
        historyService.setData('inMarkers', vm.inMarkers);


    }


    function HistoryController($scope, $log, $mdDialog, mapService, $state, dialogService,
                               $interval, intellicarAPI, historyService, $timeout, MapLeftToolBarService) {
        //var vm = this;
        //$log.log($scope);


        var vm = this;
        dialogService.setTab(0);
        $log.log('HistoryController');

        params = dialogService.getData('historyData');
        var selectedVehicle = dialogService.getData('selectedVehicle');

        vm.multiSelect = true;

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
                $scope.historyMap.zoom = 11;

                // $scope.historyInfoWindow.coords = $scope.clickedMarker;
                // $scope.historyInfoWindow.data.gpstime = new Date($scope.trace.path[0].gpstime);
                // $scope.historyInfoWindow.data.odometer = $scope.trace.path[0].odometer;
                // $scope.historyInfoWindow.data.speed = $scope.trace.path[0].speed;
                // $scope.historyInfoWindow.show = true;
                $scope.$broadcast('gotHistoryEvent', {gotHistoryEvent: true});
            }else {
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
        // $scope.getMyVehicles = function () {
        //     intellicarAPI.userService.getMyVehiclesMap({})
        //         .then(function (resp) {
        //             $log.log(resp);
        //             $scope.vehicles = resp;
        //         }, function (resp) {
        //             $log.log("handleMyVehiclesFailure");
        //             $log.log(resp);
        //         });
        // };
        //
        // $scope.getMyVehicles();


        vm.init();
        console.log($scope.clickedMarker);
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
            if ( marker)
                $log.log(marker);
            var initialPoint = marker.trace.path[0];
            $scope.tracePointGpsTime = initialPoint.gpstime;
            $scope.tracePointOdometer = initialPoint.odometer;
            $scope.tracePointSpeed = initialPoint.speed;

        };

        $scope.$on('gotHistoryEvent', function(event, data){
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

// if (Math.abs(marker.latitude - vehicleData.latitude) > 0.03 ||
//     Math.abs(marker.longitude - vehicleData.longitude) > 0.03) {
//     $log.log(marker.id + ": previous location: " + new Date(marker.timestamp) +
//         ", " + marker.latitude + ", " + marker.longitude);
//     $log.log(marker.id + ": current  location: " + new Date(vehicleData.timestamp) +
//         ", " + vehicleData.latitude + ", " + vehicleData.longitude);
// }

