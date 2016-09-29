/**
 * Created by smiddela on 10/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .service('loginService', loginService)
        .controller('loginDialogController', loginDialogController);


    function loginService($rootScope, $log, $mdDialog, authService, requestService) {
        $log.log("loginService");
        var vm = this;

        vm.login = function (username, password) {
            return requestService.firePost('/gettoken', {
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
        };

        vm.logout = function() {
            authService.logout && authService.logout()
            $rootScope.showLoginDialog = true;
            vm.loginDialog = "";
            vm.checkLogin();
        };

        vm.isAuthed = function() {
            //$log.log(authService.isAuthed());
            return authService.isAuthed ? authService.isAuthed() : false;
        };

        vm.checkLogin = function () {
            if($rootScope.showLoginDialog) {
                $log.log("Showing login");
                if( !vm.loginDialog ) {
                    vm.loginDialog = $mdDialog.confirm({
                            controller: loginDialogController,
                            //controllerAs: loginDialogCtrl,
                            templateUrl: 'app/components/login/login_dialog.html',
                            clickOutsideToClose: false,
                            escapeToClose: false
                        }
                    );

                    $mdDialog.show(vm.loginDialog);
                }
            }
        };

        requestService.addAuthListener(vm.checkLogin);
    }


    function loginDialogController($scope, $rootScope, $log, loginService, $mdDialog, $window) {
        var vm = $scope;
        $rootScope.showLoginDialog = false;
        $log.log("loginDialogController");
        vm.username = "shunmugakrishnan@intellicar.in";
        vm.password = "intellicar123";

        // vm.username = "anujkumar.k@olacabs.com";
        // vm.password = "ola123";


        function handleLoginSuccess(resp) {
            //$log.log(resp);
            //$log.log("handleLoginSuccess");
            $rootScope.showLoginDialog = false;
            $mdDialog.hide();
            vm.loginDialog ="";
            $window.location.reload();
        }

        function handleLoginFailure(resp) {
            $log.log(resp);
            $log.log("handleLoginFailure");
            vm.message = resp.data.msg;
        }

        vm.login = function () {
            $log.log("/gettoken");
            loginService.login(vm.username, vm.password)
                .then(handleLoginSuccess, handleLoginFailure);
        };

        vm.logout = function () {
            loginService.logout();
        };


        // vm.register = function () {
        //     // $log.log("register");
        //     // loginService.register(vm.username, vm.password)
        //     //     .then(handleRequest, handleRequest)
        // };
        //
        // vm.isAuthed = function () {
        //     return loginService.isAuthed();
        // }
    }
})();
