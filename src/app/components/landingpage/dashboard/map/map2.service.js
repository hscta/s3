/**
 * Created by harshas on 23/11/16.
 */

/**
 * Created by smiddela on 20/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('newMapService', function ($log, $interval, $q, $timeout, userprefService,
                                            intellicarAPI, vehicleService, $mdDialog,
                                            dialogService) {
            $log.log("newmapService");
            var vm = this;
            vm.listeners = {};

            vm.inMap = {
                map: null,
                mapOptions: {},
                markers: {
                    inMarkers: [],
                    clickedMarker: {},
                    markersByPath: {}
                },
                circles: [],
                polygons: [],
                selectedFenceObj: {
                    latitude: '',
                    longitude: '',
                    name: '',
                    other: ''
                }
            };

            vm.setInMapLocation = function (loc) {
                vm.inMap.center = angular.copy(loc);
                vm.inMap.map.setCenter({
                    lat: vm.inMap.center.latitude,
                    lng: vm.inMap.center.longitude
                });
            };

            vm.getPolygonMidPoint = function (polygon) {
                var bound = new google.maps.LatLngBounds();
                for (var idx in polygon) {
                    bound.extend(new google.maps.LatLng(polygon[idx].latitude, polygon[idx].longitude));
                }
                return bound.getCenter();
            };



            vm.showHistory = function () {
                dialogService.show('home.history', {
                    clickedMarker: vm.inMap.markers.clickedMarker
                });
            };

            vm.mobilize = function (mobilityRequest) {
                vm.inMap.markers.clickedMarker.mobilityRequest = mobilityRequest;

                var immobalizeDialog = $mdDialog.confirm({
                    controller: 'ImmobalizeController',
                    templateUrl: 'app/components/landingpage/dashboard/map/immobalize-dialog.html',
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    locals: {
                        params: {
                            clickedMarker: vm.inMap.markers.clickedMarker
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
                var scale = vm.getIconScale();
                for (var idx in vm.inMap.markers.markersByPath) {
                    vm.inMap.markers.markersByPath[idx].icon.scale = scale;
                    vm.inMap.markers.markersByPath[idx].setIcon(vm.inMap.markers.markersByPath[idx].icon);
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
            // var lat = 19.19554947109134;
            // var lng = 72.93638193466376;


            vm.loc = {
                MUMBAI: 'MUMBAI',
                BANGALORE: 'BANGALORE',
                HYDERABAD: 'HYDERABAD',
                PUNE: 'PUNE',
                CHENNAI: 'CHENNAI'
            };

            vm.locations = {
                BANGALORE: {
                    id: vm.loc.BANGALORE,
                    notation: 'BLR',
                    latlng: {latitude: 12.967995, longitude: 77.597953}
                },
                HYDERABAD: {
                    id: vm.loc.HYDERABAD,
                    notation: 'HYD',
                    latlng: {latitude: 17.384125, longitude: 78.479447}
                },
                DELHI: {
                    id: vm.loc.DELHI,
                    notation: 'DEL',
                    latlng: {latitude: 28.614132, longitude: 77.215449}
                },
                MUMBAI: {
                    id: vm.loc.MUMBAI,
                    notation: 'MUM',
                    latlng: {latitude: 19.195549, longitude: 72.936381}
                }
            };

            vm.currentLocation = vm.locations.BANGALORE;

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

            vm.zoomChanged = function () {
                if (vm.inMap.map.getZoom() % 2 == 0) {
                    vm.changeMarkerIcon();
                }
            };

            vm.getBounds = function () {
                return vm.bounds;
            };


            vm.checkZoomLevel = function (min, max) {
                // $log.log(vm.inMap.mapControl);

                // for(var prop in vm.inMap.mapControl) {
                //     if(vm.inMap.mapControl.hasOwnProperty(prop)){
                //         // $log.log('ssssssssssssss');
                //         vm.zoom = vm.inMap.mapControl.getGMap().zoom;
                //         return (vm.zoom >= min && vm.zoom <= max);
                //     }
                // }
                // $log.log(vm.zoom);

                return (vm.zoom >= min && vm.zoom <= max);

            };

            //
            // var EXTRA_SMALL = 'extra_small';
            // var SMALL = 'small';
            // var MEDIUM = 'medium';
            // var BIG = 'big';

            // vm.getMarkerSize = function () {
            //     if (vm.checkZoomLevel(1, 6)) {
            //         return EXTRA_SMALL;
            //     } else if (vm.checkZoomLevel(7, 8)) {
            //         return SMALL;
            //     } else if (vm.checkZoomLevel(9, 10)) {
            //         return MEDIUM;
            //     }
            //
            //     return BIG;
            // };


            var RED_ICON = 'red';
            var GREEN_ICON = 'green';
            var BLUE_ICON = 'blue';
            var ORANGE_ICON = 'orange';

            vm.getMarkerColor = function (rtgps) {
                if (!rtgps.mobilistatus) {
                    return RED_ICON;
                } else {
                    if (rtgps.ignitionstatus) {
                        return GREEN_ICON;
                    } else {
                        return BLUE_ICON;
                    }
                }
                return ORANGE_ICON;

                // if(str == 'red'){
                //     color = '#e74c3c'
                // }else if(str == 'green'){
                //     color = '#27ae60'
                // }else if(str == 'blue'){
                //     color = '#0000ff'
                // }else if(str == 'yellow'){
                //     color = '#f39c12'
                // }
            };

            vm.getIconScale = function () {
                var scale = 0.8 + (vm.inMap.map.getZoom() - 12) * 0.5 / 4;
                if (scale < 0.3)
                    scale = 0.3;
                return scale;
            };

            vm.getIcon = function (rtgps) {
                var direction = rtgps.direction;
                if (direction != null) {
                    direction = 0;
                }

                return {
                    path: "M20.029,15c0,2.777-2.251,5.028-5.029,5.028c-2.778,0-5.029-2.251-5.029-5.028 c0-2.778,2.251-5.029,5.029-5.029C17.778,9.971,20.029,12.222,20.029,15z M15,3.931L9.893,9.938c0,0,1.71-1.095,5.107-1.095 c3.396,0,5.107,1.095,5.107,1.095L15,3.931z",
                    fillColor: vm.getMarkerColor(rtgps),
                    rotation: direction,
                    fillOpacity: 1,
                    anchor: new google.maps.Point(15, 15),
                    strokeWeight: 1,
                    strokeColor: '#ffffff',
                    scale: vm.getIconScale()
                }
            };

            // vm.setMarkerIcon = function (rtgps) {
            //     // var newIcon = 'assets/images/markers/' + vm.getMarkerSize() + '/' + vm.getMarkerColor(vehicleData) + '-dot.png';
            //     var newIcon = vm.getIcon(rtgps);
            //     if (newIcon != rtgps.icon)
            //         rtgps.icon = newIcon;
            // };


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
                var rtgps = vehicleObj.rtgps;
                // if (!('id' in rtgps)) {
                //     var deviceidStr = rtgps.deviceid;
                //     if (deviceidStr.substring(0, 5) == '213GL') {
                //         deviceidStr = deviceidStr.substring(5);
                //     }
                //     rtgps.id = parseInt(deviceidStr);
                //     rtgps.options = {};
                //     rtgps.options.visible = false;
                // }

                vm.callListeners(rtgps, key);
            };


            vm.init = function () {
                //$log.log('map init()');
                //intellicarAPI.mqttService.addListener('rtgps', vm.updateMap);
                vehicleService.addListener('rtgps', vm.updateMarker);
            };

            vm.init();


            vm.mapStyles = {};
            vm.mapStyles.default = [];
            vm.mapStyles.dark = [
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "saturation": 36
                        },
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 40
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 16
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 20
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 17
                        },
                        {
                            "weight": 1.2
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 20
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 21
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 17
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 29
                        },
                        {
                            "weight": 0.2
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 18
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 16
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 19
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#0f252e"
                        },
                        {
                            "lightness": 17
                        }
                    ]
                }
            ];

        });
})();
