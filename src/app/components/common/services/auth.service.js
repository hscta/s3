/**
 * Created by smiddela on 21/08/16.
 */

(function() {

    'use strict';

    angular
        .module('uiplatform')
        .constant('API_HOST', 'http://asset.intellicar.in:10104')
        .constant('TOKEN_KEY', 'JWT_TOKEN_KEY')
        .service('authService', authService)
        .factory('authInterceptor', authInterceptor)
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('authInterceptor');
        });


    function authService($window, $log, TOKEN_KEY) {
        var vm = this;
        $log.log("authService");

        vm.parseJwt = function (token) {
            //$log.log(token);
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return angular.fromJson($window.atob(base64));
        };

        vm.saveToken = function (token) {
            $window.localStorage[TOKEN_KEY] = token;
        };

        vm.getToken = function () {
            return $window.localStorage[TOKEN_KEY];
        };

        vm.isAuthed = function () {
            var token = vm.getToken();
            if (token) {
                var params = vm.parseJwt(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };

        vm.logout = function () {
            $window.localStorage.removeItem(TOKEN_KEY);
        }
    }


    function authInterceptor($log, API_HOST, authService) {
        return {
            // automatically attach Authorization header
            request: function(config) {
                //$log.log(config);
                if(config.url.indexOf(API_HOST) === 0) {
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
                if(res.data && res.data.data) {
                    //$log.log(res.data.data.token);
                    if (res.config.url.indexOf(API_HOST) === 0 && res.data.data.token) {
                        authService.saveToken(res.data.data.token);
                    }
                }

                return res;
            }

            // responseError: function(res) {
            //     $log.log('interceptor');
            //     $log.log(res);
            // }
        }
    }

})();
