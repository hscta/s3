/**
 * Created by smiddela on 14/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController)
        .controller('HistoryDialogController', HistoryDialogController)
        .controller('ImmobalizeController', ImmobalizeController);

    function MapController($scope, $rootScope, $log, mapService,
                           $timeout, $mdDialog, $document, $interval,
                           rightNavAlertDashboardService) {
        $log.log('MapController');
        var vm = this;
        vm.inMarkers = [];
        vm.clickedMarker = {};
        vm.mapControl = {};
        vm.filterStr = '';
        vm.excludeMapSearch = ['icon'];
        vm.searchbox = {
            template: 'searchbox.tpl.html',
            events: {
                places_changed: function (searchBox) {
                }
            }
        };


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


        vm.loadMap = function () {
            vm.inMap = {
                window: {
                    control: {},
                    show: false
                }
            };
            vm.inMap.zoom = mapService.getZoom();
            vm.inMap.center = mapService.getCenter();
            vm.inMap.bounds = mapService.getBounds();
            //vm.marker = mapService.getMarker();
        };


        vm.updateZoom = function () {
            vm.inMap.zoom = mapService.getZoom();
            $timeout(vm.updateZoom, 4000);
        };


        vm.mapOptions = {
            //scrollwheel: false
        };


        vm.updateMarker = function (vehicleData) {
            //  $log.log('mapController updateMarker');
            //$log.log(msg);
            var isNewVehicle = true;
            //var vehicleData = vm.processVehicleData(msg);
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id == vehicleData.id) {
                    if (Math.abs(marker.latitude - vehicleData.latitude) > 0.03 ||
                        Math.abs(marker.longitude - vehicleData.longitude) > 0.03) {
                        $log.log(marker.id + ": previous location: " + new Date(marker.timestamp) +
                            ", " + marker.latitude + ", " + marker.longitude);
                        $log.log(marker.id + ": current  location: " + new Date(vehicleData.timestamp) +
                            ", " + vehicleData.latitude + ", " + vehicleData.longitude);
                    }

                    vehicleData.options = vm.inMarkers[idx].options;
                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                }
            }

            //$log.log(vehicleData);

            if (isNewVehicle) {
                vehicleData.options = {};
                vm.inMarkers.push(vehicleData);
                vm.runFilters();
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }
        };


        vm.infoWindowClose = function () {
            //vm.inMap.window.control.hideWindow();
            vm.infoWindow.control.hideWindow();
            vm.infoWindow.show = false;
        };


        vm.infoWindowShow = function () {
            //vm.inMap.window.control.showWindow();
            vm.infoWindow.control.showWindow();
            vm.infoWindow.show = true;
        };

        vm.mapEvents = {
            click: function () {
                vm.infoWindowClose();
            }

            // resize : function() {
            //     $log.log("resize event triggered");
            // }
        };

        vm.resizeMap = function () {
            google.maps.event.trigger(vm.mapControl.getGMap(), 'resize');
            return true;
        };

        $interval(vm.resizeMap, 500);

        vm.markersEvents = {
            // click: function (marker, eventName, model, args) {
            //     $log.log(model);
            //     vm.clickedMarker = model;
            //     vm.infoWindowShow();
            // },

            mouseover: function (marker, eventName, model, args) {
                vm.clickedMarker = model;

                vm.clickedMarkerObj = {
                    clickedMarker: vm.clickedMarker,
                    immoblize: vm.immobalize,
                    showHistory: vm.showHistory
                };

                vm.infoWindowShow();
                //$log.log(vm.infoWindow);
            }
        };


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
                if (vm.excludeMapSearch.indexOf(eachidx) != -1)
                    continue;

                var lowercaseSearchStr = searchStr.toString().toLowerCase();
                var lowercaseMarkerStr = marker[eachidx].toString().toLowerCase();

                if (lowercaseMarkerStr.includes(lowercaseSearchStr)) {
                    //$log.log(lowercaseSearchStr + " = " + lowercaseMarkerStr);
                    return true;
                }
            }

            //$log.log("not matching " + marker.id);
            return false;
        };

        vm.runFilters = function () {
            //$log.log("runFilters");
            if (vm.filterStr.length === 0) {
                vm.setMarkersVisible(true);
                return;
            }

            var filtered = 0;
            var matchedIdx = 0;
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (!vm.matchesAnyMarkerData(marker, vm.filterStr)) {
                    //$log.log(marker);
                    marker.options.visible = false;

                } else {
                    marker.options.visible = true;
                    vm.infoWindowClose();
                    filtered++;
                    matchedIdx = idx;
                }
            }

            if (matchedIdx) {
                if (filtered == vm.inMarkers.length) {
                    matchedIdx = Math.floor(filtered / 2);
                }
                vm.inMap.center = vm.getMarkerCenter(vm.inMarkers[matchedIdx]);
            }

            $log.log("Filtered vehicles = " + filtered);
        };


        vm.applyMapSearch = function () {
            if (vm.filterStr.length > 0) {
                //$log.log("applyMapSearch");
                vm.runFilters();
            }
        };

        //$interval(vm.applyMapSearch, 2000);


        vm.showHistory = function () {
            //$log.log(vm.clickedMarker);
            $mdDialog.show({
                controller: 'HistoryDialogController',
                templateUrl: 'app/components/landingpage/dashboard/map/history-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    params: {
                        markerObj: vm.clickedMarker,
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


    function HistoryDialogController($scope, $log, $mdDialog, mapService, $interval, params) {
        //var vm = this;
        //$log.log($scope);

        $scope.inMap = {};
        $scope.inMap.zoom = mapService.getZoom();
        $scope.inMap.center = mapService.getCenter();
        $scope.inMap.bounds = mapService.getBounds();
        $scope.mapControl = {};
        $scope.errorMsg = "";
        $log.log($scope.params);

        $scope.trace = {
            models: [],
            path: [],
            stroke: {color: "blue", weight: 2, opacity: 1},
            icons: [{ icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                offset: '60%'
            }}],
            clickable: true,
            fit: true,
            static: true,
            events: {},
            control: {},
            doRebuildAll: true
        };

        $scope.vehicleNo = params.markerObj.title;
        $scope.mapOptions = {
            //scrollwheel: false
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.resizeMap = function () {
            google.maps.event.trigger($scope.mapControl.getGMap(), 'resize');
            return true;
        };

        $scope.startTime;
        $scope.endTime;

        $scope.getHistory = function(){
            $log.log($scope.startTime);

            if (!$scope.startTime || !$scope.endTime ) {
                $log.log('errror');
                $scope.errorMsg = "Enter Start Time and End Time.";
                return;
            }

            var date = new Date($scope.startTime);
            $log.log(date);
        };



        $scope.initController = function() {
            $log.log($scope.trace);
            var blrlat = 12.9176383;
            var blrlng = 77.6480335;
            var mumlat = 19.19554947109134;
            var mumlng = 72.83638193466376;
            var chelat = 13.146503;
            var chelng = 80.059998;
            var hydlat = 17.464052;
            var hydlng = 78.456785;

            var blr = {id: 1, latitude: blrlat, longitude: blrlng};
            var mumbai = {id: 2, latitude: mumlat, longitude: mumlng};
            var chennai = {id: 3, latitude: chelat, longitude: chelng};
            var hyd = {id: 4, latitude: hydlat, longitude: hydlng};

            $scope.trace.path = [mumbai, blr, chennai, hyd];
            $scope.trace.models = $scope.trace.path;
        };

        $scope.initController();
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

})();

