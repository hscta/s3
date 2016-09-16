/**
 * Created by smiddela on 28/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('vehicleMgmtService', vehicleMgmtService);

    function vehicleMgmtService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        vm.startupData = null;
        $log.log("vehicleMgmtService");


        vm.handleGetMyVehicles = function(resp) {
            $log.log(resp);
            vm.startupData = resp;
            return vm.startupData;
        };


        vm.handleGetMyVehiclesFailure = function () {

        };


        vm.getData = function (stateParams) {
            $log.log("vehicle getData");
            $log.log(stateParams);

            // $log.log(settingsService.getRequestedGroupPath(stateParams));
            // $log.log(settingsService.getCurrentGroupPath());
            // if(settingsService.getRequestedGroupPath(stateParams) === settingsService.getCurrentGroupPath())
            //     return vm.startupData;

            settingsService.setCurrentGroup(stateParams);
            return intellicarAPI.groupService.getMyVehiclesMap(settingsService.getCurrentGroup())
                .then(vm.handleGetMyVehicles, vm.handleGetMyVehiclesFailure);
        }
    }
})();
