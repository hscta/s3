/**
 * Created by harshas on 13/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('AlarmController', AlarmController);


    function AlarmController($scope, $log, dialogService, alarmService,
                             mapService) {
        $log.log('AlarmController');

        var vm = this;
        dialogService.setTab(2);


        vm.alarms = alarmService.alarmsObj;

        $log.log(vm.alarms.vehicles);
    }

})();
