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
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;

        vm.onLoad = function () {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                 vm.assets.push(startupData[key]);
            }

            $log.log(vm.assets);
            if ( settingsService.getCurrentGroupPath() )
                vm.showBtn = true;
        };

        vm.showNewRoleField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
        };

        vm.onLoad();
    }
})();


