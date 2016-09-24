/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mapService', function ($log, intellicarAPI, $q, $timeout) {
            $log.log("mapService");
            var vm = this;
            vm.msgListeners = [];

//            var lat = 12.9176383;
//            var lng = 77.6480335;

            var lat = 19.19554947109134;
            var lng = 72.83638193466376;

            vm.center = {latitude: lat, longitude: lng};
            vm.zoom = 10;
            vm.bounds = {};

            vm.getCenter = function () {
                return vm.center;
            };

            vm.getZoom = function () {
                return vm.zoom;
            };

            vm.getBounds = function () {
                return vm.bounds;
            };

            // vm.marker = {
            //     id: 0,
            //     coords: {latitude: lat, longitude: lng},
            //     options: {draggable: true},
            //     events: {
            //         dragend: function (marker, eventName, args) {
            //             $log.log('marker dragend');
            //             var lat = marker.getPosition().lat();
            //             var lon = marker.getPosition().lng();
            //             $log.log(lat);
            //             $log.log(lon);
            //
            //             vm.marker.options = {
            //                 draggable: true,
            //                 labelContent: "lat: " + vm.marker.coords.latitude + ' ' + 'lon: ' + vm.marker.coords.longitude,
            //                 labelAnchor: "100 0",
            //                 labelClass: "marker-labels"
            //             };
            //         }
            //     }
            // };
            //
            //
            // vm.getMarker = function () {
            //     return vm.marker;
            // };
            //
            //
            // vm.updateCenter = function () {
            //     //$log.log("updateCenter");
            //     vm.center = {latitude: vm.marker.coords.latitude, longitude: vm.marker.coords.longitude};
            //     $timeout(vm.updateCenter, 1000);
            // };
            //
            //
            // vm.updateZoom = function () {
            //     //$log.log("updateZoom");
            //     if (vm.zoom == 12)
            //         vm.zoom = 14;
            //     else
            //         vm.zoom = 12;
            //     $timeout(vm.updateZoom, 5000);
            // };
            //
            //
            // vm.updateMarker = function () {
            //     //$log.log("updateMarker");
            //     vm.marker.coords = {
            //         latitude: vm.marker.coords.latitude + 0.001,
            //         longitude: vm.marker.coords.longitude + 0.001
            //     };
            //     $timeout(vm.updateMarker, 1000);
            // };


            vm.addMsgListener = function (listener) {
                if (vm.msgListeners.indexOf(listener) == -1){
                    vm.msgListeners.push(listener);
                }
            };

            var zoomLevelIcon = 'big';

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

                console.log(vm.zoom);

                if(checkZoomLevel(0,3)){
                    zoomLevelIcon = 'extra_small';
                }else if(checkZoomLevel(4,6)){
                    zoomLevelIcon = 'small';
                }else if(checkZoomLevel(7,9)){
                    zoomLevelIcon = 'medium';
                }else{
                    zoomLevelIcon = 'big';
                }

                function checkZoomLevel(min,max){
                    // console.log(vm.zoom +' <= '+ max +' && '+ vm.zoom +' >= '+ min);
                    if(vm.zoom <= max && vm.zoom >= min){
                        return true;
                    }
                    return false;
                }

                vehicleData.iconColor = iconColor;
                return 'assets/images/markers/'+zoomLevelIcon+'/' + iconColor + '-dot.png';
            };


            vm.processVehicleData = function (msg) {
                var topic = msg[0].split('/');
                var vehicleNumber = topic[topic.length - 1];
                var vehicleData = msg[1];
                vehicleData.id = parseInt(vehicleData.deviceid);
                vehicleData.title = vehicleNumber;
                vehicleData.icon = vm.setMarkerIcon(vehicleData);
                vehicleData.speed = parseFloat(parseFloat(vehicleData.speed).toFixed(2));
                vehicleData.direction = parseFloat(parseFloat(vehicleData.direction).toFixed(2));
                vehicleData.carbattery = parseFloat(parseFloat(vehicleData.carbattery).toFixed(2));
                vehicleData.devbattery = parseFloat(parseFloat(vehicleData.devbattery).toFixed(2));
                vehicleData.ignitionstatusStr = vehicleData.ignitionstatus ? "On" : "Off";
                vehicleData.ignitionstatusFilter = vehicleData.ignitionstatus ? "Running" : "Stopped";
                vehicleData.mobilistatusFilter = vehicleData.mobilistatus ? "Active" : "Immobilized";
                vehicleData.timestamp = new Date(vehicleData.timestamp);
                return vehicleData;
            };


            vm.updateMap = function (msgList) {
                if(msgList.length == 2 && msgList[0] != null && msgList[1] != null
                && msgList[0] != undefined && msgList[1] != undefined) {
                    var vehicleData = vm.processVehicleData(msgList);
                    //$log.log(vehicleData);
                    for (var eachidx in vm.msgListeners) {
                        vm.msgListeners[eachidx](vehicleData);
                    }
                }
            };


            vm.intMap = function () {
                $log.log('map initMap');
                intellicarAPI.mqttService.addMsgListener(vm.updateMap);
            };

            vm.intMap();

            // Map Icon functions

            vm.setMapIcon = function (zoom) {
                vm.zoom = zoom;
            }

        });
})();
