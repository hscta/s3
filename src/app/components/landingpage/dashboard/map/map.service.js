/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('mapService', function ($log, $interval, $q, $timeout, userprefService,
                                         intellicarAPI, vehicleService, $mdDialog,
                                         dialogService) {
            $log.log("mapService");
            var vm = this;
            vm.listeners = {};

            vm.inMap = {
                mapOptions: {},
                mapControl: {},
                mapEvents: {
                    click: function () {
                        vm.mapClickEvent();
                    },
                    zoom_changed: function () {
                        vm.changeMarkerIcon();
                    }
                },
                infoWindow: {
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
                },
                fenceInfoWindow: {
                    show: false,
                    control: {},
                    options: {
                        maxWidth: 300,
                        disableAutoPan: false,
                        pixelOffset: {
                            width: 0,
                            height: 0
                        }
                    }
                },
                markers: {
                    inMarkers: [],
                    clickedMarker: {},
                    markersEvents: {
                        click: function (marker, eventName, model, args) {
                            vm.setClickedMarker(model);
                        }
                    },
                    clickedMarkerObj: {}
                },
                circles: [],
                polygons: [],

                circleEvents: {
                    click: function (circle, eventName, model, args) {
                        //$log.log('Circle clicked');
                        vm.circleEvents(model, vm.inMap.selectedFenceObj);
                        vm.fenceInfoWindowShow();
                    }
                },

                polygonEvents: {
                    click: function (polygon, eventName, model, args) {
                        vm.polygonEvents(model, vm.inMap.selectedFenceObj);
                        vm.fenceInfoWindowShow();

                    }
                },

                selectedFenceObj: {
                    latitude: '',
                    longitude: '',
                    name: '',
                    other: ''
                }
            };

            vm.setInMapLocation = function (loc) {
                vm.inMap.center = angular.copy(loc);
            };

            vm.getPolygonMidPoint = function (polygon) {
                var bound = new google.maps.LatLngBounds();
                for (var idx in polygon) {
                    bound.extend(new google.maps.LatLng(polygon[idx].latitude, polygon[idx].longitude));
                }
                return bound.getCenter();
            };

            vm.polygonEvents = function (model, dest) {
                var polygonCenter = vm.getPolygonMidPoint(model.path);
                dest.latitude = polygonCenter.lat();
                dest.longitude = polygonCenter.lng();
                dest.name = model.control.info.name;
                dest.other = model.control.info.tagdata;
            };

            vm.circleEvents = function (model, dest) {
                dest.latitude = model.center.latitude;
                dest.longitude = model.center.longitude;
                dest.name = model.control.info.name;
                dest.other = model.control.info.tagdata;
            };


            vm.infoWindowShow = function () {
                vm.inMap.infoWindow.show = true;
            };

            vm.infoWindowClose = function () {
                vm.inMap.infoWindow.show = false;
            };


            vm.fenceInfoWindowClose = function () {
                vm.inMap.fenceInfoWindow.show = false;
            };


            vm.fenceInfoWindowShow = function () {
                vm.inMap.fenceInfoWindow.show = true;
            };

            vm.setClickedMarker = function (model) {
                vm.inMap.markers.clickedMarkerObj.clickedMarker = model;
                vm.inMap.markers.clickedMarkerObj.mobilize = vm.mobilize;
                vm.inMap.markers.clickedMarkerObj.showHistory = vm.showHistory;
                vm.inMap.markers.clickedMarkerObj.hideMobilityControls = (vehicleService.vehiclesByPath[model.vehiclepath].permissions.indexOf(74) == -1);

                vm.infoWindowShow();
            };

            vm.showHistory = function () {
                //$log.log(vm.inMap.markers.clickedMarkerObj.clickedMarker);
                dialogService.show('home.history', {
                    clickedMarker: angular.copy(vm.inMap.markers.clickedMarkerObj.clickedMarker)
                });
            };

            vm.mobilize = function (mobilityRequest) {
                vm.inMap.markers.clickedMarkerObj.clickedMarker.mobilityRequest = mobilityRequest;

                var immobalizeDialog = $mdDialog.confirm({
                    controller: 'ImmobalizeController',
                    templateUrl: 'app/components/landingpage/dashboard/map/immobalize-dialog.html',
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    locals: {
                        params: {
                            clickedMarker: vm.inMap.markers.clickedMarkerObj.clickedMarker
                        }
                    }
                }).ok('Yes').cancel('No');

                $mdDialog.show(immobalizeDialog)
                    .then(function () {
                        //$log.log("Yes Function");
                    }, function () {
                        //$log.log("No Function");
                    })
            };

            vm.mapClickEvent = function () {
                vm.fenceInfoWindowClose();
                vm.infoWindowClose();
            };

            vm.changeMarkerIcon = function () {
                var inMapMarkers = vm.inMap.markers.inMarkers;
                for (var idx = 0; idx < inMapMarkers.length; idx++) {
                    vm.setMarkerIcon(inMapMarkers[idx]);
                }
            };

            vm.getMainMap = function () {
                return vm.inMap;
            };

            // vm.getMainMarkers = function () {
            //     return vm.inMarkers;
            // };


            // Bangalore
            // var lat = 12.9176383;
            // var lng = 77.6480335;

            // Mumbai
            var lat = 19.19554947109134;
            var lng = 72.93638193466376;


            vm.loc = {
                MUMBAI: 'MUMBAI',
                BANGALORE: 'BANGALORE',
                HYDERABAD: 'HYDERABAD',
                PUNE: 'PUNE',
                CHENNAI: 'CHENNAI'
            };

            vm.locations = {
                BANGALORE:{
                    id: vm.loc.BANGALORE,
                        notation: 'BLR',
                    latlng: {latitude: 12.967995, longitude: 77.597953}
                },
                HYDERABAD:{
                    id: vm.loc.HYDERABAD,
                        notation: 'HYD',
                        latlng: {latitude: 17.384125, longitude: 78.479447}
                },
                DELHI:{
                    id: vm.loc.DELHI,
                        notation: 'DEL',
                        latlng: {latitude: 28.614132, longitude: 77.215449}
                },
                MUMBAI:{
                    id: vm.loc.MUMBAI,
                        notation: 'MUM',
                        latlng: {latitude: 19.195549, longitude: 72.936381}
                }
            };

            vm.currentLocation = vm.locations.MUMBAI;

            vm.getCurrentLocation = function () {
              return vm.currentLocation;
            };

            vm.center = vm.currentLocation.latlng;
            vm.zoom = 11;
            vm.bounds = {};

            vm.getCenter = function () {
                return vm.center;
            };

            vm.getZoom = function () {
                return vm.zoom;
            };

            vm.setZoom = function (zoom) {
                vm.zoom = zoom;
            };

            vm.getBounds = function () {
                return vm.bounds;
            };


            vm.checkZoomLevel = function (min, max) {
                // $log.log(vm.inMap.mapControl);

                for(var prop in vm.inMap.mapControl) {
                    if(vm.inMap.mapControl.hasOwnProperty(prop)){
                        // $log.log('ssssssssssssss');
                        vm.zoom = vm.inMap.mapControl.getGMap().zoom;
                        return (vm.zoom >= min && vm.zoom <= max);
                    }
                }
            };


            var EXTRA_SMALL = 'extra_small';
            var SMALL = 'small';
            var MEDIUM = 'medium';
            var BIG = 'big';

            vm.getMarkerSize = function () {
                if (vm.checkZoomLevel(1, 6)) {
                    return EXTRA_SMALL;
                } else if (vm.checkZoomLevel(7, 8)) {
                    return SMALL;
                } else if (vm.checkZoomLevel(9, 10)) {
                    return MEDIUM;
                }

                return BIG;
            };


            var RED_ICON = 'red';
            var GREEN_ICON = 'green';
            var BLUE_ICON = 'blue';
            var ORANGE_ICON = 'orange';

            vm.getMarkerColor = function (vehicleData) {
                if (!vehicleData.mobilistatus) {
                    return RED_ICON;
                } else {
                    if (vehicleData.ignitionstatus) {
                        return GREEN_ICON;
                    } else {
                        return BLUE_ICON;
                    }
                }

                return ORANGE_ICON;
            };


            vm.setMarkerIcon = function (vehicleData) {
                var newIcon = 'assets/images/markers/' + vm.getMarkerSize() + '/' + vm.getMarkerColor(vehicleData) + '-dot.png';

                if (newIcon != vehicleData.icon)
                    vehicleData.icon = newIcon;
            };


            vm.getMarkerIndex = function (id) {
                for (var idx in vm.inMap.markers.inMarkers) {
                    if (vm.inMap.markers.inMarkers[idx].id === id)
                        return idx;
                }
                return -1;
            };


            vm.addListener = function (key, listener) {
                if (!(key in vm.listeners)) {
                    vm.listeners[key] = [];
                }

                if (vm.listeners[key].indexOf(listener) === -1) {
                    vm.listeners[key].push(listener);
                }
            };


            vm.callListeners = function (msg, key) {
                if (key in vm.listeners) {
                    for (var idx in vm.listeners[key]) {
                        vm.listeners[key][idx](msg, key);
                    }
                }
            };


            vm.updateMarker = function (vehicleObj, key) {
                var vehicleData = vehicleObj.rtgps;
                if (!('id' in vehicleData)) {
                    var deviceidStr = vehicleData.deviceid;
                    if (deviceidStr.substring(0, 5) == '213GL') {
                        deviceidStr = deviceidStr.substring(5);
                    }
                    vehicleData.id = parseInt(deviceidStr);
                    vehicleData.options = {};
                    vehicleData.options.visible = false;
                }

                vm.setMarkerIcon(vehicleData);
                vm.callListeners(vehicleData, key);
            };


            vm.init = function () {
                //$log.log('map init()');
                //intellicarAPI.mqttService.addListener('rtgps', vm.updateMap);
                vehicleService.addListener('rtgps', vm.updateMarker);
            };

            vm.init();

        });
})();
