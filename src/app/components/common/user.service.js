/**
 * Created by smiddela on 19/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('userService', userService);

    function userService($rootScope, $log, $q, requestService) {
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

            vm.getMyVehicleTree = function(body) {
                $log.log("userService getMyVehicleTree");
                // $log.log(body);
                return requestService.firePost('/user/myvehicles', body)
                    .then(vm.handleResponse, vm.handleFailure);

            }

        // vm.getMyUserWEditView = function(body) {
        //     $log.log("userService getMyUserWEditView");
        //     $log.log(body);
        //     return requestService.firePost('/user/myusersweditview', body)
        //         .then(vm.handleResponse, vm.handleFailure);
        // };

    }
})();
