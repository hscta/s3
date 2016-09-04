/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('DeviceMgmtController', DeviceMgmtController);

    function DeviceMgmtController($scope, $rootScope, $log, $state,
                                  intellicarAPI, settingsService, startupData) {

        $log.log('DeviceMgmtController');
        var vm = this;
        vm.data = [];
        settingsService.setTab(intellicarAPI.appConstants.DEVICE);

        vm.onLoad = function () {
            $log.log("my device data");
            $log.log(startupData);

            for (var key in startupData) {
                vm.details = {};
                if (startupData.hasOwnProperty(key)) {
                    //$log.log(key + " -> " + startupData[key].name);
                    vm.details['name'] = startupData[key].name;
                    //vm.details['id'] = startupData[key].vehicleid;
                    vm.details['id'] = startupData[key].assetid;
                    $log.log(vm.details);
                    vm.data.push(vm.details);
                    $scope = vm.data;
                }
            }
        };

        vm.onLoad();
    }
})();


