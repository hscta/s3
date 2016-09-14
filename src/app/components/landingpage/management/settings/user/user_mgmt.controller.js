/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('UserMgmtController', UserMgmtController);

    function UserMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, userMgmtService,
                                settingsService, startupData) {

        $log.log('UserMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.USER);
        var vm = this;
        vm.assets = [];
        vm.newUser = {};

        vm.onLoad = function () {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                vm.assets.push(startupData[key]);
            }

            $log.log(vm.assets);
        };


        vm.createUser = function () {
            userMgmtService.createUser(vm.newUser)
                .then(function (resp) {
                        $log.log(resp);
                        vm.newUser = {};
                        $rootScope.$broadcast('EVENT_MGMT_TREE_CHANGE', {});
                    },
                    function (resp) {
                        $log.log("CREATE USER FAILED");
                        $log.log(resp)
                    });
        };


        vm.onLoad();
    }
})();


