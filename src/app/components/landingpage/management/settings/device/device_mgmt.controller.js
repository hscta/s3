/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('DeviceMgmtController', DeviceMgmtController);

    function DeviceMgmtController($scope, $rootScope, $log, $state,
                                  intellicarAPI, settingsService, startupData) {

        $log.log('DeviceMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.constantFactory.DEVICE);

        vm.onLoad = function() {
            //$log.log("my startup data");
            $log.log(startupData);
        };

        vm.onLoad();
    }
})();


