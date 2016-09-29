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
                'name': 'Geofences Reports',
                'icon': 'fa-bar-chart',
                'type': 'button',
                'data': {'type': 'stateChange', 'state': 'home.geofence'}
            },

            {
                'name': 'Geofences ', 'icon': 'fa-globe', 'type': 'button', 'data': {
                'type': 'function', 'function': function (active) {
                    geofenceViewService.getMyFences();
                }
            }
            },

            {'type': 'line'},

            {
                'name': 'City Limits', 'icon': 'fa-road', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('City Limits');
                }
            }
            },

            {
                'name': 'Service Center', 'icon': 'fa-wrench', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('Service station');
                }
            }
            },

            {
                'name': 'No Go', 'icon': 'fa-ban', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('No Go');
                }
            }
            },

            {
                'name': 'Low Battery', 'icon': 'fa-battery-quarter', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('Low Battery');
                }
            }
            }
        ];

        vm.buttonClick = function (data) {
            if (data.type == 'stateChange') {
                dialogService.show(data.state);
            } else if (data.type == 'function') {
                data.active = !data.active;
                data.function(data.active);
            }
        };

        //geofenceViewService.getMyFences();
    }

})();

