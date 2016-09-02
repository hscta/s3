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
        };

        vm.firePost = function(api, body, auth) {
            api = API_HOST + api;

            if(body === null)
                body = {};

            if(auth == null || auth)
                auth = true;
            else
                auth = false;

            if(!auth)
                return $http.post(api, body);

            if(authService.isAuthed() || api.indexOf('gettoken') > 0) {
                return $http.post(api, body)
                    .catch(vm.handleFailure)
            } else {
                $log.log("user not authenticated");
                vm.checkLogin();
                return $q.reject({'auth': false});
            }
        };


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
        };


        vm.handleFailure = function(resp) {
            $log.log("API returned error");
            $log.log(resp);
            if(errorStatusCodes.indexOf(resp.status) != -1) {
                $log.log("failure status code");
                //vm.checkLogin(true);
            }

            return $q.reject(resp);
        };

        vm.checkLogin = function(force) {
            if(!authService.isAuthed() || force) {
                angular.forEach(authListeners, function(value, key) {
                    // calling callback
                    $log.log("calling show login");
                    value();
                });
            }
        };

        vm.addAuthListener = function(callback) {
            //$log.log('adding login callback');
            authListeners.push(callback)
        };


        // If required. It is periodically called from maincontroller to check for valid token
        // currently disabled in maincontroller
        vm.isLoginTokenValid = function() {
            //$log.log("isLoginTokenVaild");
            vm.checkLogin(false);
        }
    }

})();

