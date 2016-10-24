/**
 * Created by smiddela on 12/08/16.
 */

(function () {


    angular
        .module('uiplatform')
        .controller('GeofenceViewController', mapLeftToolBar);

    function mapLeftToolBar($scope, $log, $timeout, $q, mapService,
                            geofenceViewService, dialogService, intellicarAPI) {

        var vm = this;

        vm.leftToolbar = function () {
            return geofenceViewService.getToolbarVar();
        };

        vm.toggleBar = function () {
            if (vm.leftToolbar()) {
                geofenceViewService.hide();
            } else {
                geofenceViewService.show();
            }
        };

        vm.loc = {
            MUMBAI: 'MUMBAI',
            BANGALORE: 'BANGALORE',
            HYDERABAD: 'HYDERABAD',
            DELHI: 'DELHI'
        };

        vm.currentLocation = vm.loc.MUMBAI; // Have to set it Dynamically

        vm.setInMarkerLocation = function (data) {
            vm.currentLocation = data.id;
            mapService.setInMapLocation(data.latlng);
        };

        // mapService.setInMapLocation(latlng: {latitude: 12.967995, longitude: 77.597953}); // banglore

        vm.leftTB = [
            {
                'id': 'geoReport',
                'name': 'Geofences Reports',
                'iconType': 'fa',
                'icon': 'fa-bar-chart',
                'type': 'button',
                'historymap': true,
                'data': {
                    'type': 'stateChange', 'independent': true, 'state': 'home.geofence', active: true
                }
            },
            {'type': 'line', 'historymap': true},
            {
                'id': 'setLocation',
                'name': false,
                'iconType': 'fa',
                'icon': 'fa-map-marker',
                'type': 'button',
                'historymap': false,
                'data': {
                    'type': 'function', 'independent': true, 'function': function (active) {

                    }
                },
                'childType':'location',
                'children': [
                    {
                        id: vm.loc.BANGALORE,
                        notation: 'BLR',
                        latlng: {latitude: 12.967995, longitude: 77.597953}
                    }, {
                        id: vm.loc.HYDERABAD,
                        notation: 'HYD',
                        latlng: {latitude: 17.384125, longitude: 78.479447}
                    }, {
                        id: vm.loc.DELHI,
                        notation: 'DEL',
                        latlng: {latitude: 28.614132, longitude: 77.215449}
                    }, {
                        id: vm.loc.MUMBAI,
                        notation: 'MUM',
                        latlng: {latitude: 19.195549, longitude: 72.936381}
                    }
                ]
            },
            // {'type': 'line', 'historymap': false},


            {
                'id': 'setGeoFilter',
                'name': false,
                'iconType': 'png',
                'icon': 'assets/images/icon/fence',
                'type': 'button',
                'historymap': false,
                'data': {
                    'type': 'function', 'independent': true, 'function': function (active) {

                    }
                },
                'childType':'button',
                'children': [
                    {
                        'id': 'setGeoFilter.showAll',
                        'name': 'Show All', 'iconType': 'fa', 'icon': 'fa-eye', 'type': 'toggleButton', 'historymap': true,
                        'data': {
                            active: true,
                            'type': 'function', 'function': function (active) {
                                vm.checkGeoFilters.all('setGeoFilter.showAll');
                            }
                        }
                    },
                    {
                        'id': 'setGeoFilter.parkingLot',
                        'name': 'Parking Lot',
                        'iconType': 'md',
                        'icon': 'local_parking',
                        'type': 'toggleButton',
                        'historymap': true,
                        'data': {
                            active: true,
                            'type': 'function', 'function': function (active) {
                                vm.checkGeoFilters.set('setGeoFilter.parkingLot', active);
                            }
                        }
                    },
                    {
                        'id': 'setGeoFilter.serviceStation',
                        'name': 'Service Station',
                        'iconType': 'fa',
                        'icon': 'fa-wrench',
                        'type': 'toggleButton',
                        'historymap': true,
                        'data': {
                            active: true,
                            'type': 'function', 'function': function (active) {
                                vm.checkGeoFilters.set('setGeoFilter.serviceStation', active);
                            }
                        }
                    },
                    {
                        'id': 'setGeoFilter.competitorHub',
                        'name': 'Competitor Hub',
                        'iconType': 'fa',
                        'icon': 'fa-ban',
                        'type': 'toggleButton',
                        'historymap': true,
                        'data': {
                            active: true,
                            'type': 'function', 'function': function (active) {
                                vm.checkGeoFilters.set('setGeoFilter.competitorHub', active);
                            }
                        }
                    },
                    {
                        'id': 'setGeoFilter.cityLimits',
                        'name': 'City Limits', 'iconType': 'fa', 'icon': 'fa-road', 'type': 'toggleButton', 'historymap': true,
                        'data': {
                            active: false,
                            'type': 'function', 'function': function (active) {
                                vm.checkGeoFilters.set('setGeoFilter.cityLimits', active);
                            }
                        }
                    },
                    {
                        'id': 'setGeoFilter.getGeo', 'description': 'Use only when new fences are created',
                        'name': 'Refresh Geofences', 'iconType': 'fa', 'icon': 'fa-globe', 'type': 'button', 'historymap': true,
                        'data': {
                            active: true,
                            'type': 'function', 'function': function () {
                                geofenceViewService.getMyFences();
                            }
                        }
                    },
                ]
            },

            {
                'id': 'batteryFilter',
                'name': false,
                'iconType': 'fa',
                'icon': 'fa-exclamation-triangle',
                'type': 'button',
                'historymap': false,
                'data': {
                    'type': 'function', 'independent': true, 'function': function (active) {

                    }
                },
                'childType':'button',
                'children': [
                    {
                        'id': 'batteryFilter.devBattery',
                        'name': 'Low Device battery',
                        'iconType': 'fa',
                        'icon': 'fa-battery-quarter',
                        'type': 'toggleButton',
                        'historymap': false,
                        'data': {
                            active: false,
                            'type': 'function', 'independent': true, 'function': function (active) {
                                vm.checkGeoFilters.set('batteryFilter.devBattery', active);
                            }
                        }
                    },
                    {
                        'id': 'batteryFilter.carBattery',
                        'name': 'Low Vehicle battery', 'iconType': 'png', 'icon': 'assets/images/icon/carBattery',
                        'type': 'toggleButton', 'historymap': false,
                        'data': {
                            active: false,
                            'type': 'function', 'independent': true, 'function': function (active) {
                                vm.checkGeoFilters.set('batteryFilter.carBattery', active);
                            }
                        }
                    },
                    {
                        'id': 'batteryFilter.noComm',
                        'name': 'Vehicles not communicating',
                        'iconType': 'png',
                        'icon': 'assets/images/icon/signal',
                        'type': 'toggleButton',
                        'historymap': false,
                        'data': {
                            active: false,
                            'type': 'function', 'independent': true, 'function': function (active) {
                                vm.checkGeoFilters.set('batteryFilter.noComm', active);
                            }
                        }
                    },
                ]
            },

            // {'type': 'line', 'historymap': false},
            // {
            //     'id': 'showVehicleNo',
            //     'name': 'Vehicle number',
            //     'iconType': 'fa',
            //     'icon': 'fa-car',
            //     'type': 'toggleButton',
            //     'historymap': false,
            //     'data': {
            //         active: false,
            //         'type': 'function', 'independent': true, 'function': function (active) {
            //             vm.checkGeoFilters.set('showVehicleNo', active);
            //             geofenceViewService.showVehicleNumber(active);
            //         }
            //     }
            // }
            // {'type': 'line', 'historymap': false},
        ];

        vm.fencesActive = function () {
            //$log.log("got fences " + geofenceViewService.getData('geofences'));
            return geofenceViewService.getData('geofences');
        };


        vm.childClick = function (data,type) {
            if(type == 'location'){
                vm.currentLocation = data.id;
                mapService.setInMapLocation(data.latlng);
            }else if(type == 'button'){
                data();
            }
        };



        vm.init = function () {
            vm.geoFilters = geofenceViewService.getData('geoFilters');
            // $log.log(vm.geoFilters);
            for (var key in vm.geoFilters) {
                if (vm.geoFilters[key]) {
                    setActive(key, true);
                } else {
                    setActive(key, false);
                }
            }
        };


        vm.checkGeoFilters = {
            all: function (showAll) {
                var allActive = true;
                if (vm.geoFilters.showAll) {
                    allActive = false;
                }
                setActive('setGeoFilter.showAll', allActive);
                setActive('setGeoFilter.competitorHub', allActive);
                setActive('setGeoFilter.serviceStation', allActive);
                setActive('setGeoFilter.parkingLot', allActive);
                setFilter(showAll);
            },
            check: function () {
                if (vm.geoFilters.parkingLot && vm.geoFilters.serviceStation && vm.geoFilters.competitorHub) {
                    setActive('setGeoFilter.showAll', true)
                } else {
                    setActive('setGeoFilter.showAll', false);
                }
            },
            set: function (id, active) {
                setActive(id, active);
                vm.checkGeoFilters.check();
                setFilter(id);
            }
        };

        function setActive(id, active) {
            var rid = id;
            id = id.split('.');
            if(id.length <= 1){
                id = id[0];
                for (var key in vm.leftTB) {
                    if (vm.leftTB.hasOwnProperty(key)) {
                        if (vm.leftTB[key].id == id) {
                            vm.leftTB[key].data.active = active;
                            addFilter(vm.leftTB[key].id, active);
                        }
                    }
                }
            }else{
                for(var idx=0; idx < vm.leftTB.length; idx++){
                    if(vm.leftTB[idx].id==id[0]){
                        for (var key in vm.leftTB[idx].children) {
                            if (vm.leftTB[idx].children.hasOwnProperty(key)) {
                                if (vm.leftTB[idx].children[key].id == rid) {
                                    vm.leftTB[idx].children[key].data.active = active;
                                    addFilter(vm.leftTB[idx].children[key].id, active);
                                }
                            }
                        }
                    }
                }
            }
        }

        function addFilter(filter, active) {
            filter = filter.split('.')
            filter = filter[filter.length - 1];
            vm.geoFilters[filter] = active;
            console.log(filter +' : '+vm.geoFilters[filter]);
        }

        function setFilter(filterType) {
            filterType = filterType.split('.')
            filterType = filterType[filterType.length - 1];
            geofenceViewService.applyFilters(filterType);
        }

        function filterList(searchPattern) {
            $log.log(searchPattern);
        }


        vm.buttonClick = function (item) {
            if (item.data.type == 'stateChange') {
                dialogService.show(item.data.state);
            } else if (item.data.type == 'function') {
                if (vm.fencesActive() || item.data.independent) {
                    item.data.active = !item.data.active;
                    item.data.function(item.data.active, item.location);
                }
            }
        };

        vm.init();
    }

})();

