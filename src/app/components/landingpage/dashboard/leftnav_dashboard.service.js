/**
 * Created by smiddela on 13/08/16.
 */

(function() {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavDashboardService', function($rootScope, $log, $q, API, requestService) {
            var vm = this;
            vm.treeCallback = null;
            $log.log("leftNavDashboardService");

            vm.handleResponse = function(resp) {
                $log.log("handleResponse");
                $log.log(resp);
                if(vm.treeCallback != null)
                    vm.treeCallback(resp);
                //return $q.resolve(resp)
            };

            vm.handleFailure = function(resp) {
                $log.log("handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };

            vm.getTree = function(event, data) {
                $log.log("service getTree");
                // $log.log(event);
                // $log.log(data);
                requestService.firePost(API + '/user/mygroups', {
                    "user":{
                       // "userpath":"/1/1/1/7/2/9",
                      //  "grouppath":"/1/1/1/7/1/8"
                    }
                }).then(vm.handleResponse, vm.handleFailure);
            };

            vm.addTreeCallback = function(callback) {
                vm.treeCallback = callback;
            }

            //$rootScope.$on('getLeftnavData', vm.getTree);
        });

})();
