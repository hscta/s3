/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('UserMgmtController', UserMgmtController);

    function UserMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, settingsService, startupData) {

        $log.log('UserMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.USER);
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


