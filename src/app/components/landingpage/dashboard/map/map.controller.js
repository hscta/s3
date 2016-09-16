/**
 * Created by smiddela on 14/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController);

    function MapController($scope, $rootScope, $log, mapService,
                           $timeout, $mdDialog, $document, $interval) {
        $log.log('MapController');
        var vm = this;
        vm.inMarkers = [];
        vm.clickedMarker = {};
        vm.showMap = true;
        vm.mapControl = {};

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


        vm.options = {
            //scrollwheel: false
        };


        vm.setMarkerIcon = function (vehicleData) {
            var iconColor = 'green';

            if (!vehicleData.mobilistatus) {
                iconColor = 'red';
            } else if (!vehicleData.ignitionstatus) {
                iconColor = 'green';
            } else if(vehicleData.ignitionstatus) {
                iconColor = 'blue';
            }

            return 'http://maps.google.com/mapfiles/ms/icons/' + iconColor + '-dot.png';
        };


        vm.processVehicleData = function (msg) {
            var topic = msg[0].split('/');
            var vehicleNumber = parseInt(topic[topic.length - 1]);
            var vehicleData = msg[1];
            vehicleData.id = vehicleNumber;
            vehicleData.icon = vm.setMarkerIcon(vehicleData);
            vehicleData.title = vehicleNumber;
            vehicleData.speed = parseFloat(vehicleData.speed).toFixed(2);
            vehicleData.direction = parseFloat(vehicleData.direction).toFixed(2);
            vehicleData.carbattery = parseFloat(vehicleData.carbattery).toFixed(2);
            vehicleData.devbattery = parseFloat(vehicleData.devbattery).toFixed(2);
            vehicleData.ignitionstatus = vehicleData.ignitionstatus ? "Running" : "Not Running";
            vehicleData.mobilistatusStr = vehicleData.mobilistatus ? "Mobilized" : "Immobilized";
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

                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                }
            }

            if (isNewVehicle) {
                vm.inMarkers.push(vehicleData);
                // $log.log("Total number of vehicles seen since page load = " + vm.inMarkers.length);
            }
        };


        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
        };

        vm.mapEvents = {
            click : function(){
                vm.infoWindow.show = false;
            },

            // resize : function() {
            //     $log.log("resize event triggered");
            // }
        };

        vm.resizeMap = function() {
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
                window.setTimeout(function(){
                31
                    vm.infoWindow.show = true;
                },200);
            },
            // mouseout: function (marker, eventName, model, args) {
            //     vm.infoWindow.show = false;
            // }
        };


        vm.infoWindow = {
            marker: {},
            show: false,
            options: {
            }
        };


        vm.closeClick = function () {
            vm.infoWindow.show = false;
        };


        vm.immobalize = function (status) {
            var immobalizeDialog = $mdDialog.confirm({
                controller: immobalizeController,
                templateUrl: '/app/components/landingpage/dashboard/map/immobalize-dialog.html',
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
