/**
 * Created by smiddela on 14/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController);

    // var HistoryDialogController = function($scope, $log, id, mapService) {
    //     var vm = this;
    //     $log.log(id);
    //     vm.inMap = {};
    //     vm.inMap.zoom = mapService.getZoom();
    //     vm.inMap.center = mapService.getCenter();
    //     vm.inMap.bounds = mapService.getBounds();
    //     vm.mapControl = {};
    //     $log.log(vm.inMap)
    //     vm.mapOptions = {
    //         //scrollwheel: false
    //     };
    // };


    function MapController($scope, $rootScope, $log, mapService,
                           $timeout, $mdDialog, $document, $interval) {
        $log.log('MapController');
        var vm = this;
        vm.inMarkers = [];
        vm.clickedMarker = {};
        vm.showMap = true;
        vm.mapControl = {};
        vm.mapSearchStr = '';
        vm.excludeMapSearch = ['icon'];

        function immobalizeController($scope, $mdDialog) {
            var vm = this;
            $log.log('immobalizeController');

            $scope.cancelImmobalize = function () {
                $log.log('cancelImmobalize');
                $mdDialog.cancel();
            };

            $scope.okImmobilize = function () {
                $log.log('okImmobilize');
                $mdDialog.cancel();
            }
        }


        vm.loadMap = function () {
            vm.inMap = {};
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


        vm.setMarkerIcon = function (vehicleData) {
            var iconColor = 'orange';

            if (!vehicleData.mobilistatus) {
                iconColor = 'red';
            } else {
                if (vehicleData.ignitionstatus) {
                    iconColor = 'blue';
                } else {
                    iconColor = 'green';
                }
            }

            vehicleData.iconColor = iconColor;
            return 'http://maps.google.com/mapfiles/ms/icons/' + iconColor + '-dot.png';
        };


        vm.processVehicleData = function (msg) {
            var topic = msg[0].split('/');
            var vehicleNumber = parseInt(topic[topic.length - 1]);
            var vehicleData = msg[1];
            vehicleData.id = vehicleNumber;
            vehicleData.icon = vm.setMarkerIcon(vehicleData);
            vehicleData.title = vehicleNumber;
            vehicleData.speed = parseFloat(parseFloat(vehicleData.speed).toFixed(2));
            vehicleData.direction = parseFloat(parseFloat(vehicleData.direction).toFixed(2));
            vehicleData.carbattery = parseFloat(parseFloat(vehicleData.carbattery).toFixed(2));
            vehicleData.devbattery = parseFloat(parseFloat(vehicleData.devbattery).toFixed(2));
            vehicleData.ignitionstatus = vehicleData.ignitionstatus ? "Running" : "Stopped";
            vehicleData.mobilistatusStr = vehicleData.mobilistatus ? "Active" : "Immobilized";
            //vehicleData.active = vehicleData.mobilistatus ? "Active" : "Inactive";
            vehicleData.timestamp = new Date(vehicleData.timestamp).toString().replace(" GMT+0530 (IST)", "");
            return vehicleData;
        };


        vm.updateMarker = function (msg) {
            //  $log.log('mapController updateMarker');
            //$log.log(msg);
            var isNewVehicle = true;
            var vehicleData = vm.processVehicleData(msg);
            //$log.log(vehicleData);

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

            if (isNewVehicle) {
                vehicleData.options = {};
                vm.inMarkers.push(vehicleData);
                vm.mapSearch();
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }
        };


        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
        };

        vm.mapEvents = {
            click: function () {
                vm.infoWindow.show = false;
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
            //     vm.infoWindow.show = true;
            // },
            mouseover: function (marker, eventName, model, args) {
                vm.clickedMarker = model;

                vm.clickedMarkerObj ={
                    clickedMarker : vm.clickedMarker,
                    immoblize : vm.immobalize,
                    showHistory: vm.showHistory
                }
                vm.infoWindow.show = true;
            }
        };


        vm.infoWindow = {
            marker: {},
            show: false,
            options: {}
        };


        vm.closeClick = function () {
            vm.infoWindow.show = false;
        };


        vm.immobalize = function (status) {
            var immobalizeDialog = $mdDialog.confirm({
                controller: immobalizeController,
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
            $log.log('cancel dialog');
            $mdDialog.cancel();
        };

        vm.setMarkersVisible = function (flag) {
            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                marker.options.visible = flag;
            }
        };


        vm.matchesAnyMarkerData = function (marker, searchStr) {
            for (eachidx in marker) {
                if (vm.excludeMapSearch.indexOf(eachidx) != -1)
                    continue;

                lowercaseSearchStr = searchStr.toString().toLowerCase();
                lowercaseMarkerStr = marker[eachidx].toString().toLowerCase();

                if (lowercaseMarkerStr.includes(lowercaseSearchStr)) {
                    //$log.log(lowercaseSearchStr + " = " + lowercaseMarkerStr);
                    return true;
                }
            }

            //$log.log("not matching " + marker.id);
            return false;
        };

        vm.mapSearch = function () {
            var matched = 0;
            if (vm.mapSearchStr.length === 0) {
                vm.setMarkersVisible(true);
                return;
            }

            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (!vm.matchesAnyMarkerData(marker, vm.mapSearchStr)) {
                    //$log.log(marker);
                    marker.options.visible = false;

                } else {
                    matched++;
                }
            }
            $log.log("Search matched " + matched + " vehicles");
        };


        vm.applyMapSearch = function () {
            if (vm.mapSearchStr.length > 0) {
                //$log.log("applyMapSearch");
                vm.mapSearch();
            }
        };

        //$interval(vm.applyMapSearch, 2000);


        vm.showHistory = function (id){
            $log.log(id);
            $mdDialog.show({
                controller: vm.HistoryDialogController,
                templateUrl: 'app/components/landingpage/dashboard/map/history-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                fullscreen: false,
                locals: {
                    id: id
                }
            })
        };

        vm.HistoryDialogController = function($scope, $log, id, mapService) {
            var vm = this;
            $log.log(id);
            $scope.inMap = {};
            $scope.inMap.zoom = mapService.getZoom();
            $scope.inMap.center = mapService.getCenter();
            $scope.inMap.bounds = mapService.getBounds();
            $scope.mapControl = {};
            $log.log(vm.inMap)
            $scope.mapOptions = {
                //scrollwheel: false
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };
        };



        vm.loadMap();
        vm.addListener();

        // $scope.$watch(function() {
        //     return $rootScope.left_nav_toggle;
        // }, function() {
        //     $log.log("leftnavtoggle " + $rootScope.left_nav_toggle);
        //     for(var i = 0; i < 100; i++) {
        //         google.maps.event.trigger(vm.mapControl.getGMap(), 'resize');
        //     }
        // });
    }
})();


/*
 var testData = {
 id: 2056245,
 odometer: 458,
 speed: 0.144,
 direction: 0,
 carbattery: 13.764706,
 devbattery: 4.002353,
 ignitionstatus: 1,
 latitude: 19.068246270422406,
 longitude: 72.90032345164258,
 messagetype: 11,
 mobilistatus: 1,
 nosatellites: 17,
 timestamp: 1474024383000,
 altitude: 1,
 title: 2056245
 };
 */
