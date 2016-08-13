// /**
//  * Created by smiddela on 08/08/16.
//  */
// (function() {
//
//     'use strict';
//
//     angular.module('uiplatform')
//         .controller('LoginController', function ($scope, $rootScope, $log, $timeout, $mdDialog, loginService) {
//             $log.log("LoginController");
//             var vm = this;
//             //vm.username = "smiddela@intellicar.in";
//             vm.username = "shunmugakrishnan@intellicar.in";
//             vm.password = "intellicar123";
//
//
//             function handleRequest(res) {
//                 var token = res.data ? res.data.token : null;
//                 if (token) {
//                     $log.log('JWT:', token);
//                 }
//                 vm.message = res.data ? res.data.message : null;
//             }
//
//             vm.login = function () {
//                 $log.log("/gettoken")
//                 loginService.login(vm.username, vm.password)
//                     .then(handleRequest, handleRequest)
//             }
//
//             vm.register = function () {
//                 //$log.log("register");
//                 loginService.register(vm.username, vm.password)
//                     .then(handleRequest, handleRequest)
//             }
//
//             vm.getQuote = function () {
//                 loginService.getQuote()
//                     .then(handleRequest, handleRequest)
//             }
//
//             vm.logout = function () {
//                 loginService.logout();
//             }
//
//             vm.isAuthed = function () {
//                 return loginService.isAuthed();
//             }
//
//             vm.showLogin = function () {
//                 // $log.log("showLogin");
//                 // if ($rootScope.showLogin) {
//                 //     var loginDialog = $mdDialog.confirm({
//                 //             controller: loginDialogController,
//                 //             //controllerAs: loginDialogCtrl,
//                 //             templateUrl: 'login_dialog.html',
//                 //             clickOutsideToClose: false
//                 //         }
//                 //     );
//                 //
//                 //     $mdDialog.show(loginDialog);
//                 //     $rootScope.showLogin = false;
//                 //
//                 // } else {
//                 //     $rootScope.showLogin = false;
//                 // }
//                 //
//                 // $timeout(vm.checkAuth, 500);
//             }
//
//             vm.checkPageLoadAuth = function() {
//                 if(!vm.isAuthed()) {
//                     $rootScope.showLogin = true;
//                 }
//             }
//
//             //vm.checkPageLoadAuth();
//             vm.showLogin();
//         })
//
//
//     // function loginDialogController($scope, $log, loginService) {
//     //     var vm = this;
//     //
//     //     $log.log("something");
//     //     function handleRequest(res) {
//     //         $log.log(res);
//     //         $log.log("dialog handleRequest");
//     //     }
//     //
//     //     $scope.login = function () {
//     //         $log.log("/gettoken")
//     //         loginService.login(vm.username, vm.password)
//     //             .then(handleRequest, handleRequest)
//     //     }
//     //
//     //     vm.register = function () {
//     //         $log.log("register");
//     //         loginService.register(vm.username, vm.password)
//     //             .then(handleRequest, handleRequest)
//     //     }
//     //
//     //     vm.getQuote = function () {
//     //         loginService.getQuote()
//     //             .then(handleRequest, handleRequest)
//     //     }
//     //
//     //     vm.logout = function () {
//     //         loginService.logout();
//     //     }
//     //
//     //     vm.isAuthed = function () {
//     //         return loginService.isAuthed();
//     //     }
//     // }
//
//
// })();
