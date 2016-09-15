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


        vm.createUser = function () {
            if (vm.newUser.password === vm.confirmPassword) {
                userMgmtService.createUser(vm.newUser)
                    .then(function (resp) {
                            $log.log(resp);
                            vm.newUser = {};
                            vm.confirmPassword = '';
                            $rootScope.$broadcast('EVENT_MGMT_TREE_CHANGE', {});
                            vm.errorMsg = "User created successfully."
                        },
                        function (resp) {
                            $log.log("CREATE USER FAILED");
                            $log.log(resp);
                            vm.errorMsg = "Failed to create user."
                        });
            }else {
                vm.errorMsg = "Passwords do not match";
                return;
            }
        };

        vm.showNewUserField = function () {
            $log.log('show/hide');
            vm.errorMsg = ""
            vm.isdiplay = !vm.isdiplay;
        };


        vm.onLoad();
    }
})();


