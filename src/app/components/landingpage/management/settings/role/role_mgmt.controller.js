/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $q,
                                intellicarAPI, settingsService, startupData,
                                roleMgmtService) {
        $log.log('RoleMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.ROLE);
        var vm = this;
        vm.assets = [];

        vm.onLoad = function () {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                vm.assets.push(startupData[key]);
            }

            $log.log(vm.assets);
        };

        vm.onLoad();
    }
})();


