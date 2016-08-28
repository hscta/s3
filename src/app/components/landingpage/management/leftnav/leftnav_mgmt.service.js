/**
 * Created by smiddela on 13/08/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('leftNavManagementService', function ($log, $q, intellicarAPI, settingsService) {
            $log.log("leftNavManagementService");

            var vm = this;
            vm.listeners = {};

            vm.handleResponse = function (resp) {
                $log.log("leftNavManagementService handleResponse");
                $log.log(resp);
                settingsService.setCurrentGroup({group: {grouppath: resp[0].id}});
                return $q.resolve(resp);
            };


            vm.handleFailure = function (resp) {
                $log.log("leftNavManagementService handleFailure ");
                $log.log(resp);
                return $q.reject(resp);
            };


            vm.getManagementTree = function (body) {
                return intellicarAPI.treeDataService.getManagementTree(body)
                    .then(vm.handleResponse, vm.handleFailure);
                    //body.group = {grouppath: '/1/1', recursive: '0'};
                //return intellicarAPI.userService.getMyDirectAssetsMap(body);
            };


            vm.addListener = function (key, listener) {
                vm.listeners[key] = listener;
            };

        });
})();