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

            var lat = 12.9176383;
            var lng = 77.6480335;

            vm.center = {latitude: lat, longitude: lng};
            vm.zoom = 12;
            vm.bounds = {};

            vm.marker = {
                id: 0,
                coords: {latitude: lat, longitude: lng},
                options: {draggable: true},
                events: {
                    dragend: function (marker, eventName, args) {
                        $log.log('marker dragend');
                        var lat = marker.getPosition().lat();
                        var lon = marker.getPosition().lng();
                        $log.log(lat);
                        $log.log(lon);

                        vm.marker.options = {
                            draggable: true,
                            labelContent: "lat: " + vm.marker.coords.latitude + ' ' + 'lon: ' + vm.marker.coords.longitude,
                            labelAnchor: "100 0",
                            labelClass: "marker-labels"
                        };
                    }
                }
            };


            vm.getCenter = function () {
                return vm.center;
            };

            vm.getZoom = function () {
                return vm.zoom;
            };

            vm.getMarker = function () {
                return vm.marker;
            };

            vm.getBounds = function () {
                return vm.bounds;
            };

            vm.updateCenter = function () {
                //$log.log("updateCenter");
                vm.center = {latitude: vm.marker.coords.latitude, longitude: vm.marker.coords.longitude};
                $timeout(vm.updateCenter, 1000);
            };


            vm.updateZoom = function () {
                //$log.log("updateZoom");
                if (vm.zoom == 12)
                    vm.zoom = 14;
                else
                    vm.zoom = 12;
                $timeout(vm.updateZoom, 5000);
            };


            vm.updateMarker = function () {
                //$log.log("updateMarker");
                vm.marker.coords = {
                    latitude: vm.marker.coords.latitude + 0.001,
                    longitude: vm.marker.coords.longitude + 0.001
                };
                $timeout(vm.updateMarker, 1000);
            };


            vm.addMsgListener = function (listener) {
                if (vm.msgListeners.indexOf(listener) == -1){
                    vm.msgListeners.push(listener);
                }
            };


            vm.updateMap = function (msgList) {
                //$log.log('mapService updateMap');
                //$log.log(msgList);
                for(var idx in msgList) {
                    var msg = msgList[idx];
                    for(var eachidx in vm.msgListeners){
                        vm.msgListeners[eachidx](msg);
                    }
                }
            };


            vm.intMap = function () {
                $log.log('map initMap');
                intellicarAPI.mqttService.addMsgListener(vm.updateMap);
            };

            vm.intMap();

            vm.mapMsg = {
                'timebucket': 0,
                'lat': 0,
                'lng': 0,
                'speed' : 0,
                'direction' : 0,
                'satellite' : 0,
                'devicebattery': 0,
                'carbattery': 0
            };

            vm.immobilizeMsg = {
                'status': 0,
                'statustime': 0,
                'lastcommandtime': 0
            };
        });
})();
