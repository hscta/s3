/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('UserMgmtController', UserMgmtController);

    function UserMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, settingsService, startupData) {

        $log.log('UserMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.constantFactory.USER);


        vm.onLoad = function() {
            //$log.log("my startup data");
            $log.log(startupData);
        };

        vm.onLoad();
    }
})();


