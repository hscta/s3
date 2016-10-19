/**
 * Created by smiddela on 12/08/16.
 */

(function () {


    angular
        .module('uiplatform')
        .controller('GeofenceViewController', mapLeftToolBar);

    function mapLeftToolBar($scope, $log, $timeout, $q,
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
                'id': 'getGeo', 'description': 'Use only when new fences are created',
                'name': 'Refresh Geofences', 'iconType': 'fa', 'icon': 'fa-globe', 'type': 'button', 'historymap': true,
                'data': {
                    active: true,
                    'type': 'function', 'function': function () {
                        geofenceViewService.getMyFences();
                    }
                }
            },
            {
                'id': 'showAll',
                'name': 'Show All', 'iconType': 'fa', 'icon': 'fa-eye', 'type': 'toggleButton', 'historymap': true,
                'data': {
                    active: true,
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.all('showAll');
                    }
                }
            },
            {
                'id': 'parkingLot',
                'name': 'Parking Lot',
                'iconType': 'md',
                'icon': 'local_parking',
                'type': 'toggleButton',
                'historymap': true,
                'data': {
                    active: true,
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('parkingLot', active);
                    }
                }
            },
            {
                'id': 'serviceStation',
                'name': 'Service Station',
                'iconType': 'fa',
                'icon': 'fa-wrench',
                'type': 'toggleButton',
                'historymap': true,
                'data': {
                    active: true,
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('serviceStation', active);
                    }
                }
            },
            {
                'id': 'competitorHub',
                'name': 'Competitor Hub',
                'iconType': 'fa',
                'icon': 'fa-ban',
                'type': 'toggleButton',
                'historymap': true,
                'data': {
                    active: true,
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('competitorHub', active);
                    }
                }
            },
            {
                'id': 'cityLimits',
                'name': 'City Limits', 'iconType': 'fa', 'icon': 'fa-road', 'type': 'toggleButton', 'historymap': true,
                'data': {
                    active: false,
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('cityLimits', active);
                    }
                }
            },
            {'type': 'line', 'historymap': true},
            {
                'id': 'devBattery',
                'name': 'Low Device battery',
                'iconType': 'fa',
                'icon': 'fa-battery-quarter',
                'type': 'toggleButton',
                'historymap': false,
                'data': {
                    active: true,
                    'type': 'function', 'independent': true, 'function': function (active) {
                        vm.checkGeoFilters.set('devBattery', active);
                    }
                }
            },
            {
                'id': 'carBattery',
                'name': 'Low Vehicle battery', 'iconType': 'png', 'icon': 'assets/images/icon/carBattery.png',
                'type': 'toggleButton', 'historymap': false,
                'data': {
                    active: true,
                    'type': 'function', 'independent': true, 'function': function (active) {
                        vm.checkGeoFilters.set('carBattery', active);
                    }
                }
            },
            {
                'id': 'showVehicleNo',
                'name': 'Vehicle number',
                'iconType': 'fa',
                'icon': 'fa-car',
                'type': 'toggleButton',
                'historymap': false,
                'data': {
                    active: false,
                    'type': 'function', 'independent': true, 'function': function (active) {
                        vm.checkGeoFilters.set('showVehicleNo', active);
                        geofenceViewService.showVehicleNumber(active);
                    }
                }
            },
            {'type': 'line', 'historymap': false},
            {
                'id': 'noComm',
                'name': 'Vehicles not communicating',
                'iconType': 'fa',
                'icon': 'fa-bug',
                'type': 'toggleButton',
                'historymap': false,
                'data': {
                    active: true,
                    'type': 'function', 'independent': true, 'function': function (active) {
                        vm.checkGeoFilters.set('noComm', active);
                    }
                }
            },
            // {'type': 'line', 'historymap': false},
        ];

        vm.fencesActive = function () {
            //$log.log("got fences " + geofenceViewService.getData('geofences'));
            return geofenceViewService.getData('geofences');
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
                setActive('showAll', allActive);
                setActive('competitorHub', allActive);
                setActive('serviceStation', allActive);
                setActive('parkingLot', allActive);
                setFilter(showAll);
            },
            check: function () {
                if (vm.geoFilters.parkingLot && vm.geoFilters.serviceStation && vm.geoFilters.competitorHub) {
                    setActive('showAll', true)
                } else {
                    setActive('showAll', false);
                }
            },
            set: function (id, active) {
                setActive(id, active);
                vm.checkGeoFilters.check();
                setFilter(id);
            }
        };

        function setActive(id, active) {
            for (var key in vm.leftTB) {
                if (vm.leftTB.hasOwnProperty(key)) {
                    if (vm.leftTB[key].id == id) {
                        vm.leftTB[key].data.active = active;
                        addFilter(vm.leftTB[key].id, active);
                    }
                }
            }
        }

        function addFilter(filter, active) {
            vm.geoFilters[filter] = active;
        }

        function setFilter(filterType) {
            // $log.log(filterType + " = " + vm.geoFilters[filterType]);
            geofenceViewService.applyFilters(filterType);
        }

        function filterList(searchPattern){
          $log.log(searchPattern);
        }


        vm.buttonClick = function (data) {
            if (data.type == 'stateChange') {
                dialogService.show(data.state);
            } else if (data.type == 'function') {
                if (vm.fencesActive() || data.independent) {
                    data.active = !data.active;
                    data.function(data.active);
                }
            }
        };

        vm.init();
    }

})();

