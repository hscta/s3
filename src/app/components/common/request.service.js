/**
 * Created by smiddela on 08/08/16.
 */
(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('requestService', requestService);

    function requestService($log, $http, $q, API_HOST, authService) {
        var vm = this;
        var authListeners = [];
        var errorStatusCodes = [400, 401, 403];

        $log.log("requestService");

        vm.getToken = function() {
            return authService.getToken();
        }

        vm.firePost = function(api, data, auth) {
            api = API_HOST + api;

            if(auth == null || auth)
                auth = true;
            else
                auth = false;

            if(!auth)
                return $http.post(api, data);

            if(authService.isAuthed() || api.indexOf('gettoken') > 0) {
                return $http.post(api, data)
                    .catch(vm.handleFailure)
            } else {
                $log.log("user not authenticated");
                vm.checkLogin();
                return $q.reject({'auth': false});
            }
        }


        vm.fireGet = function(api, auth) {
            api = API_HOST + api;

            if(auth == null || auth)
                auth = true;
            else
                auth = false;

            if(!auth)
                return $http.post(api);

            if(authService.isAuthed() || api.indexOf('gettoken') > 0) {
                return $http.post(api)
                    .catch(vm.handleFailure)
            } else {
                $log.log("user not authenticated");
                vm.checkLogin();
                return $q.reject({'auth': false});
            }
        }


        vm.addAuthListener = function(callback) {
            //$log.log('adding login callback');
            authListeners.push(callback)
        }

        vm.handleFailure = function(res) {
            $log.log("api returned error");
            $log.log(res);
            if(errorStatusCodes.indexOf(res.status) != -1) {
                $log.log("failure status code");
                vm.checkLogin(true);
            }
        }

        vm.checkLogin = function(force) {
            if(!authService.isAuthed() || force) {
                angular.forEach(authListeners, function(value, key) {
                    // calling callback
                    $log.log("calling show login");
                    value();
                });
            }
        }

        // If required. It is periodically called from maincontroller to check for valid token
        // currently disabled in maincontroller
        vm.isLoginTokenValid = function() {
            //$log.log("isLoginTokenVaild");
            vm.checkLogin(false);
        }
    }

})();

