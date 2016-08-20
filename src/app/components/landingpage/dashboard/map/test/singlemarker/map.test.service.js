/**
 * Created by smiddela on 20/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('mapTestService', function($log, intellicarAPI, $q, $timeout) {
            $log.log("mapTestService");
            var vm = this;
            var lat = 12.9176383;
            var lng = 77.6480335;

            vm.center = { latitude: lat, longitude: lng };
            vm.zoom = 12;

            vm.marker = {
                id: 0,
                coords: { latitude: lat, longitude: lng },
                options: { draggable: true },
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


            vm.getCenter = function() {
                return vm.center;
            }

            vm.getZoom = function() {
                return vm.zoom;
            }

            vm.getMarker = function() {
                return vm.marker;
            }

            vm.updateCenter = function() {
                //$log.log("updateCenter");
                vm.center = { latitude: vm.marker.coords.latitude, longitude: vm.marker.coords.longitude};
                $timeout(vm.updateCenter, 1000);
            }

            vm.updateZoom = function() {
                //$log.log("updateZoom");
                if(vm.zoom == 12)
                    vm.zoom = 14;
                else
                    vm.zoom = 12;
                $timeout(vm.updateZoom, 5000);
            }

            vm.updateMarker = function() {
                //$log.log("updateMarker");
                vm.marker.coords = {
                    latitude: vm.marker.coords.latitude + 0.001,
                    longitude: vm.marker.coords.longitude + 0.001
                };
                $timeout(vm.updateMarker, 1000);
            }



            vm.updateMarker();
            vm.updateCenter();
            vm.updateZoom();
        });
})();
