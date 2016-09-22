
(function () {
    'use strict';

    angular.module('uiplatform')
        .service('MapLeftToolBarService', MapLeftToolBarService);

    function MapLeftToolBarService($log,GeofenceService) {

        var vm = this;
        vm.toolbar = true;


        vm.getService = function(id){
            if(id == 'geofences'){
                return GeofenceService;
            }
        }


    }



})();
/**
 * Created by User on 22-09-2016.
 */
