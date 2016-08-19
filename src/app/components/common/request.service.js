/**
 * Created by smiddela on 08/08/16.
 */
(function() {

    'use strict';

    angular
        .module('uiplatform')
        .constant('TOKEN_KEY', 'JWT_TOKEN_KEY')
        .constant('API', 'http://asset.intellicar.in:10104')
        .service('authService', authService)
        .factory('authInterceptor', authInterceptor)
        .service('requestService', requestService)
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('authInterceptor');
        })

    function authService($window, $log, TOKEN_KEY) {
        var vm = this;
        $log.log("authService");

        vm.parseJwt = function(token) {
            //$log.log(token);
            var base64Url = token.split('.')[1];
            //$log.log(base64Url);
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return angular.fromJson($window.atob(base64));
        }

        vm.saveToken = function(token) {
            $window.localStorage[TOKEN_KEY] = token;
        }

        vm.getToken = function() {
            return $window.localStorage[TOKEN_KEY];
        }

        vm.isAuthed = function() {
            var token = vm.getToken();
            if(token) {
                var params = vm.parseJwt(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        }

        vm.logout = function() {
            $window.localStorage.removeItem(TOKEN_KEY);
        }

        // Add JWT methods here
    }


    function authInterceptor($log, $q, API, authService) {
        return {
            // automatically attach Authorization header
            request: function(config) {
                //$log.log(config);

                if(config.url.indexOf(API) === 0) {
                    if (config.method == 'POST') {
                        if (!(config.url.indexOf('gettoken') > 0)) {
                            config.data.token = authService.getToken();
                        }
                    } else if(config.method == 'GET') {
                        //config.headers.Authorization = 'Bearer ' + authService.getToken();
                    }
                }

                return config;

            },

            // If a token was sent back, save it
            response: function(res) {
                //$log.log(res);
                //$log.log(res.config.url + ", " + API);
                if(res.data && res.data.data) {
                    //$log.log(res.data.data.token);
                    if (res.config.url.indexOf(API) === 0 && res.data.data.token) {
                        authService.saveToken(res.data.data.token);
                    }
                }

                //if(res.status >= 400 && res.status < 500)
                //$log.log("resolving " + res.status);

                //return $q.resolve(res);
                return res;
            },

            // responseError: function(res) {
            //     $log.log('interceptor');
            //     $log.log(res);
            // }

        }
    }


    function requestService($rootScope, $http, $log, $interval, $q, authService) {
        var vm = this;
        var authListeners = [];
        var errorStatusCodes = [400, 401, 403];

        $log.log("requestService");

        vm.getToken = function() {
            return authService.getToken();
        }

        vm.firePost = function(api, data, auth) {
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

        vm.isLoginTokenValid = function() {
            $log.log("isLoginTokenVaild");
            vm.checkLogin(false);
            //$interval(vm.isLoginTokenValid, 5000);
        }

        //vm.isLoginTokenValid();
    }

})();

