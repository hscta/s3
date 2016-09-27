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
            {'name':'Geofences', 'icon':'fa-globe', 'state':'home.geofence' },
            // {'name':'Cab Service', 'icon':'fa-cab'},
            // {'name':'Tasks', 'icon':'fa-tasks' },
            // {'name':'Tags', 'icon':'fa-tag' },
            // {'name':'User', 'icon':'fa-user' },
            // {'name':'Settings', 'icon':'fa-gears' }
        ];

        vm.buttonClick = function (state) {
            dialogService.show(state);
        }



    }

})();

