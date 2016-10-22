/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('AlarmController', AlarmController);


    function AlarmController($scope, $log, $mdDialog, dialogService,
                               $interval, $timeout, intellicarAPI, historyService,
                               geofenceViewService, $state) {
        $log.log('AlarmController');

        var vm = this;
        dialogService.setTab(0);

    }

})();
