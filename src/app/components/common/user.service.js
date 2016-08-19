/**
 * Created by smiddela on 19/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('userService', function($rootScope, $log, $q, API, requestService) {
            var vm = this;
            $log.log("userService");

            vm.handleResponse = function(resp) {
                $log.log("handleResponse");
                return $q.resolve(resp)
            };

            vm.handleFailure = function(resp) {
                $log.log("handleFailure ");
                return $q.reject(resp);
            };

            vm.getMyVehicles = function(event, data) {
                $log.log("service getMyVehicles");
                // $log.log(event);
                // $log.log(data);
                return requestService.firePost(API + '/user/myvehicles', {
                    "user":{
                        //"userpath":"/1/1/1/7/2/9",
                        //"grouppath":"/1/1/1/7/1/8"
                    }
                }).then(vm.handleResponse, vm.handleFailure);
            };
        });

})();
