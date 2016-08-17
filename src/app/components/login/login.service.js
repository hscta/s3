/**
 * Created by smiddela on 10/08/16.
 */

(function() {

    function loginDialogController($scope, $rootScope, $mdDialog, $log, loginService) {
        var vm = $scope;
        $rootScope.showLoginDialog = false;
        $log.log("loginDialogController");
        vm.username = "shunmugakrishnan@intellicar.in";
        vm.password = "intellicar123";


        function handleLoginSuccess(res) {
            //$log.log(res);
            $log.log("handleLoginSuccess");
            $rootScope.showLoginDialog = false;
            $mdDialog.hide();
        }

        function handleLoginFailure(res) {
            $log.log(res);
            $log.log("handleLoginFailure");
        }

        vm.login = function () {
            $log.log("/gettoken")
            loginService.login(vm.username, vm.password)
                .then(handleLoginSuccess, handleLoginFailure)
        }

        vm.register = function () {
            // $log.log("register");
            // loginService.register(vm.username, vm.password)
            //     .then(handleRequest, handleRequest)
        }

        vm.logout = function () {
            loginService.logout();
        }

        vm.isAuthed = function () {
            return loginService.isAuthed();
        }
    }


    function loginService($rootScope, $http, $log, $q, $mdDialog, API, authService, requestService) {
        var vm = this;

        vm.login = function (username, password) {
            return requestService.firePost(API + '/gettoken', {
                "user": {
                    type: "local",
                    username: username,
                    password: password
                }
            }).then(function (response) {
                //$log.log("he he he ho ho ho");
                $log.log(response);
                //$rootScope.$on('getData', vm.getData);
                //return response;
                //authService.saveToken(response.data.token);
            });
        }

        vm.logout = function() {
            authService.logout && authService.logout()
        }

        vm.isAuthed = function() {
            return authService.isAuthed ? authService.isAuthed() : false
        }

        vm.checkLogin = function () {
            if($rootScope.showLoginDialog) {
                $log.log("Showing login");
                var loginDialog = $mdDialog.confirm({
                        controller: loginDialogController,
                        //controllerAs: loginDialogCtrl,
                        templateUrl: '/app/components/login/login_dialog.html',
                        clickOutsideToClose: false,
                        escapeToClose: false
                    }
                );

                $mdDialog.show(loginDialog);
            }
        }

        requestService.addAuthListener(vm.checkLogin);

        // vm.isLoginValid = function() {
        //     vm.checkLogin();
        //     $interval(vm.isLoginTokenValid, 1000);
        // }
        //
        // vm.isLoginValid();

        // add authentication methods here
    }

    angular
        .module('uiplatform')
        .service('loginService', loginService)
        .controller('loginDialogController', loginDialogController)
        //.constant('API', 'http://asset.intellicar.in:10104')

})();
