/**
 * Created by smiddela on 14/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('MapController', MapController);

    function MapController($scope, $rootScope, $log, mapService, $timeout, $mdDialog) {
        $log.log('MapController');
        var vm = this;
        vm.inMarkers = [];
        vm.clickedMarker = {};

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
            vm.marker = mapService.getMarker();
        };


        vm.updateZoom = function () {
            vm.inMap.zoom = mapService.getZoom();
            $timeout(vm.updateZoom, 4000);
        };


        vm.options = {
            //scrollwheel: false
        };


        vm.getVehicleData = function (msg) {
            var topic = msg[0].split('/');
            var vehicleNumber = parseInt(topic[topic.length  - 1]);
            var vehicleData = msg[1];
            vehicleData.id = vehicleNumber;
            vehicleData.title = vehicleNumber;
            return vehicleData;
        };


        vm.updateMarker = function (msg) {
            //  $log.log('mapController updateMarker');
            //$log.log(msg);
            var isNewVehicle = true;
            var vehicleData = vm.getVehicleData(msg);
            //$log.log(vehicleData);

            for (var idx in vm.inMarkers) {
                var marker = vm.inMarkers[idx];
                if (marker.id == vehicleData.id) {
                    vm.inMarkers[idx] = vehicleData;
                    isNewVehicle = false;
                }

                if (vm.clickedMarker.id == marker.id) {
                    //$log.log(msg);
                    vm.clickedMarker = vehicleData;
                    $log.log(vm.clickedMarker);
                }
            }

            if(isNewVehicle) {
                vm.inMarkers.push(vehicleData);
            }
        };


        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
        };


        vm.markersEvents = {
            click: function (marker, eventName, model, arguments) {
                //vm.infoWindow.model = model;
                vm.infoWindow.show = true;

                vm.clickedMarker = model;
                vm.id = vm.clickedMarker.id;
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


        vm.immobalize = function () {
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
    }
})
();


// vm.updateMarkerTest = function (msg) {
//     // $log.log('mapController updateMarker');
//     //$log.log(msg);
//
//     if (vm.inMarkers.length < 2) {
//         vm.inMarkers.push(msg);
//     }
//
//     for (var idx in vm.inMarkers) {
//         var marker = vm.inMarkers[idx];
//         if (marker.id == msg.id) {
//             msg.title = 'mypath: ' + msg.id;
//             vm.inMarkers[idx] = msg;
//         }
//
//         if (vm.clickedMarker.id == marker.id) {
//             //$log.log(msg);
//             vm.clickedMarker = msg;
//         }
//     }
// };

