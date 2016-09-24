
(function () {
    'use strict';

    angular.module('uiplatform')
        .service('MapLeftToolBarService', MapLeftToolBarService);

    function MapLeftToolBarService($log,GeofenceService) {

        var vm = this;
        vm.toolbar = true;

        vm.getToolbarVar = function(){
            return vm.toolbar;
        }

        vm.hide = function(){
            vm.toolbar = false;
        }

        vm.show = function(){
            vm.toolbar = true;
        }

        // vm.dialogTab = 0;


        vm.getService = function(id){
            if(id == 'geofences'){
                return GeofenceService;
            }
        }

        //historyService.setData('selectedTab', vm.dialogTab);
    }



})();
/**
 * Created by User on 22-09-2016.
 */
