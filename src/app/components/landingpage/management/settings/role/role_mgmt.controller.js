/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, settingsService, startupData) {
        $log.log('RoleMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.constantFactory.ROLE);


        vm.onLoad = function() {
            //$log.log("my startup data");
            $log.log(startupData);
        };

        vm.onLoad();
    }
})();


