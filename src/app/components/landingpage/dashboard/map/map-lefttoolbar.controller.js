/**
 * Created by smiddela on 12/08/16.
 */

(function(){


    angular
        .module('uiplatform')
        .controller('MapLeftToolBarController', mapLeftToolBar);

    function mapLeftToolBar($scope, $rootScope, $log, mapService,
                              $timeout, $mdDialog, $document, $interval,
                              rightNavAlertDashboardService,MapLeftToolBarService,dialogService) {

        var vm = this;

        vm.leftToolbar = function (){
            return MapLeftToolBarService.getToolbarVar();
        }

        vm.toggleBar = function(){
            if(vm.leftToolbar()){
                MapLeftToolBarService.hide();
            }else{
                MapLeftToolBarService.show();
            }
        }


        vm.leftTB = [
            {'name':'Geofences Reports', 'icon':'fa-bar-chart','type':'button','data':
                {'type':'stateChange','state':'home.geofence'} },

            {'name':'Geofences ', 'icon':'fa-globe', 'type':'button','data':
                {'type':'function','function':function (active) {
                    console.log(active);
                }}
            },

            {'type':'line'},

            {'name':'City Limits', 'icon':'fa-road', 'type':'button','data':
                {'type':'function','function':function () {
                    console.log('City Limits');
                }}
            },

            {'name':'Service Center', 'icon':'fa-wrench','type':'button', 'data':
                {'type':'function','function':function () {
                    console.log('Service center');
                }}
            },

            {'name':'No Go', 'icon':'fa-ban','type':'button', 'data':
                {'type':'function','function':function () {
                    console.log('No Go');
                }}
            },

            {'name':'Low Battery', 'icon':'fa-battery-quarter' ,'type':'button', 'data':
                {'type':'function','function':function () {
                    console.log('Low Battery');
                }}
            },
        ];

        vm.buttonClick = function (data) {
            if (data.type == 'stateChange') {
                dialogService.show(data.state);
            } else if (data.type == 'function') {
                if(data.active){
                    data.active = false;
                }else{
                    data.active = true;
                }
                data.function(data.active);
            }
        }



    }

})();

