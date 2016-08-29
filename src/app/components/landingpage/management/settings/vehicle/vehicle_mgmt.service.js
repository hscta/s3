/**
 * Created by smiddela on 28/08/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('vehicleMgmtService', vehicleMgmtService);

    function vehicleMgmtService($rootScope, $log, $q, $state, intellicarAPI, settingsService) {
        var vm = this;
        $log.log("vehicleMgmtService");


        vm.getData = function(stateParams) {
            $log.log("vehicle getData");

            $log.log(stateParams.info);

            settingsService.setCurrentGroup({group: {grouppath: stateParams.info.pgrouppath}});

            stateParams.state = $state.current.name;
            return intellicarAPI.groupService.getMyVehiclesMap(settingsService.getCurrentGroup());
        }
    }
})();
