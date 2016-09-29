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
                'id':'geoReport',
                'name': 'Geofences Reports', 'iconType':'fa', 'icon': 'fa-bar-chart', 'type': 'button', 'data': {
                    'type': 'stateChange', 'state': 'home.geofence'
                }
            },
            {'type': 'line'},
            {
                'id':'getGeo',
                'name': 'Get Geofences','iconType':'fa', 'icon': 'fa-globe', 'type': 'button', 'data': {
                    'type': 'function', 'function': function () {
                        geofenceViewService.getMyFences();
                    }
                }
            },
            {
                'id':'showAll',
                'name': 'Show All', 'iconType':'fa','icon': 'fa-eye', 'type': 'toggleButton', 'data': {
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.all();
                    }
                }
            },
            {
                'id':'parkingLot',
                'name': 'Parking Lot','iconType':'md', 'icon': 'local_parking', 'type': 'toggleButton', 'data': {
                'type': 'function', 'function': function (active) {
                    vm.checkGeoFilters.set('parkingLot',active);
                }
            }
            },
            {
                'id':'serviceStation',
                'name': 'Service Station', 'iconType':'fa','icon': 'fa-wrench', 'type': 'toggleButton', 'data': {
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('serviceStation',active);
                    }
                }
            },
            {
                'id':'competitorHub',
                'name': 'Competitor Hub', 'iconType':'fa','icon': 'fa-ban', 'type': 'toggleButton', 'data': {
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('competitorHub',active);
                    }
                }
            },
            {
                'id':'cityLimits',
                'name': 'City Limits', 'iconType':'fa','icon': 'fa-road', 'type': 'toggleButton', 'data': {
                'type': 'function', 'function': function (active) {
                    vm.checkGeoFilters.set('cityLimits',active);
                }
            }
            },
            {'type': 'line'},
            {
                'id':'lowBattery',
                'name': 'lowBattery','iconType':'fa', 'icon': 'fa-battery-quarter', 'type': 'toggleButton', 'data': {
                    'type': 'function', 'function': function (active) {
                        vm.checkGeoFilters.set('lowBattery',active);
                    }
                }
            },
        ];

        vm.fencesActive = function () {
            return geofenceViewService.getData('geofences');
        }


        vm.init = function () {
            vm.filters = geofenceViewService.getData('geoFilters');
            for (var key in vm.filters) {
                if (vm.filters.hasOwnProperty(key) && vm.filters[key]) {
                    setActive(key,'true');
                }
            }
        };

        vm.checkGeoFilters = {
            all:function() {
                var allActive = true;
                if(vm.filters.showAll){
                    allActive = false;
                }
                setActive('showAll',allActive);
                setActive('competitorHub',allActive);
                setActive('serviceStation',allActive);
                setActive('parkingLot',allActive);
                geofenceViewService.applyFilters(vm.filters);
            },
            check:function () {
                if(vm.filters.parkingLot && vm.filters.serviceStation && vm.filters.competitorHub){
                    setActive('showAll',true)
                }else{
                    setActive('showAll',false);
                }
            },
            set:function (id,active) {
                setActive(id,active);
                vm.checkGeoFilters.check();
                geofenceViewService.applyFilters(vm.filters);
            }
        };

        function setActive(id,active) {
            for (var key in vm.leftTB) {
                if (vm.leftTB.hasOwnProperty(key)) {
                    if(vm.leftTB[key].id == id){
                        vm.leftTB[key].data.active = active;
                        setFilter(vm.leftTB[key].id, active);
                    }
                }
            }
        }

        function setFilter(filter,active) {
            vm.filters[filter] = active;
        }


        vm.buttonClick = function (data) {
            if (data.type == 'stateChange') {
                dialogService.show(data.state);
            } else if (data.type == 'function') {
                if(vm.fencesActive()) {
                    data.active = !data.active;
                    data.function(data.active);
                }
            }
        };

        vm.init();
        //geofenceViewService.getMyFences();
    }

})();

