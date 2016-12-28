/**
 * Created by harshas on 23/11/16.
 */

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
            vm.filterStr = "";

            vm.inMap = {
                map: null,
                mapOptions: {},
                markers: {
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
                var latlng = new google.maps.LatLng (vm.inMap.center.latitude, vm.inMap.center.longitude);
                vm.inMap.map.setCenter(latlng);
                vm.inMap.map.setZoom(11);
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

            vm.getMainMap = function () {
                return vm.inMap;
            };


            vm.loc = {
                USER: 'USER',
                MUMBAI: 'MUMBAI',
                BANGALORE: 'BANGALORE',
                HYDERABAD: 'HYDERABAD',
                PUNE: 'PUNE',
                DELHI: 'DELHI',
                CHENNAI: 'CHENNAI',
                KOLKATA: 'KOLKATA'
            };


            vm.locations = [
                {
                    id: vm.loc.USER,
                    notation: 'USR',
                    latlng: {latitude: 19.195549, longitude: 72.936381}
                }, {
                    id: vm.loc.MUMBAI,
                    notation: 'MUM',
                    latlng: {latitude: 19.195549, longitude: 72.936381}
                }, {
                    id: vm.loc.BANGALORE,
                    notation: 'BLR',
                    latlng: {latitude: 12.967995, longitude: 77.597953}
                }, {
                    id: vm.loc.HYDERABAD,
                    notation: 'HYD',
                    latlng: {latitude: 17.384125, longitude: 78.479447}
                }, {
                    id: vm.loc.PUNE,
                    notation: 'PUN',
                    latlng: {latitude: 18.521445, longitude: 73.866031}
                }, {
                    id: vm.loc.DELHI,
                    notation: 'DEL',
                    latlng: {latitude: 28.614132, longitude: 77.215449}
                }, {
                    id: vm.loc.CHENNAI,
                    notation: 'CHE',
                    latlng: {latitude: 13.075837, longitude: 80.206900}
                }, {
                    id: vm.loc.KOLKATA,
                    notation: 'KOL',
                    latlng: {latitude: 22.6754795, longitude: 88.0877022}
                }
            ];

            vm.currentLocation = vm.locations[1];

            vm.setUserPref = function (userSettings) {
                vm.currentLocation = vm.locations[0];
                vm.currentLocation.latlng = userSettings.station;
                vm.center = vm.currentLocation.latlng;
                //vm.callListeners(userSettings, 'setUserPref');
            };

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


            vm.getBounds = function () {
                return vm.bounds;
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
                vehicleService.addListener('rtgps', vm.updateMarker);
                userprefService.addListener('setUserPref', vm.setUserPref);
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
