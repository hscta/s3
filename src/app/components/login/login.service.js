/**
 * Created by smiddela on 10/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .service('loginService', loginService)
        .controller('loginDialogController', loginDialogController);


    function loginService($rootScope, $log, $mdDialog, authService, requestService) {
        $log.log("loginService");
        var vm = this;
        vm.username = '';
        vm.password = '';
        vm.listeners = {};


        vm.addListener = function (key, listener) {
            if (!(key in vm.listeners)) {
                vm.listeners[key] = [];
            }

            if (vm.listeners[key].indexOf(listener) === -1) {
                vm.listeners[key].push(listener);
            }
        };


        vm.callListeners = function (msg, key) {
            if (key in vm.listeners) {
                for (var idx in vm.listeners[key]) {
                    vm.listeners[key][idx](msg, key);
                }
            }
        };


        vm.login = function (username, password) {
            return requestService.firePost('/gettoken', {
                "user": {
                    type: "local",
                    username: username,
                    password: password
                }
            }).then(function (resp) {
                // $log.log(resp);
                vm.username = username;
                vm.password = password;
                vm.callListeners(resp, 'loginSuccess');
                return resp;
            });
        };

        vm.logout = function () {
            authService.logout && authService.logout();
            $rootScope.showLoginDialog = true;
            vm.loginDialog = "";
            vm.checkLogin();
        };

        vm.isAuthed = function () {
            //$log.log(authService.isAuthed());
            return authService.isAuthed ? authService.isAuthed() : false;
        };

        vm.checkLogin = function () {
            if ($rootScope.showLoginDialog) {
                $log.log("Showing login");
                if (!vm.loginDialog) {
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

        vm.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;

        //vm.username = "shunmugakrishnan@intellicar.in";
        //vm.password = "intellicar123";

        // vm.username = "anujkumar.k@olacabs.com";
        // vm.password = "ola123";


        function handleLoginSuccess(resp) {
            // $log.log(resp);
            $log.log("handleLoginSuccess");
            $rootScope.showLoginDialog = false;
            $mdDialog.hide();
            vm.loginDialog = "";
            $window.location.reload();
        }

        function handleLoginFailure(resp) {
            $log.log(resp);
            $log.log("handleLoginFailure");
            if (resp && resp.data && resp.msg)
                $log.log(resp);
                vm.errorMsg = resp.data.msg;
        }

        vm.onChangeCredentials = function(){
            if (!(vm.username && vm.password)){
                vm.errorMsg = "Please enter valid Username and Password";
                return;
            }
            else
                vm.errorMsg = '';

            // if ( !vm.username.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/)) {
            //     vm.errorMsg = "Please Enter valid username";
            //     return;
            // }
        };

        vm.login = function () {
            if ( vm.errorMsg ) return;
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
