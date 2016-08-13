/**
 * Created by smiddela on 13/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('leftnavService', function($log, API, requestService) {
            var vm = this;

            vm.handleResponse = function(res) {
                $log.log("handleResponse");
                $log.log(res);
            }

            vm.handleFailure = function(res) {
                $log.log("handleFailure ");
                $log.log(res);
                return res.data;
            }

            vm.getTree = function() {
                requestService.firePost(API + '/user/vehicles', {
                    "user":{
                        "userpath":"/1/1/1/7/2/9",
                        "grouppath":"/1/1/1/7/1/8"
                    }
                }).then(vm.handleResponse, vm.handleFailure);
            }
        });

})();
