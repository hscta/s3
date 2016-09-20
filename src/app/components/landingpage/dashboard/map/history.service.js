/**
 * Created by smiddela on 20/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('historyService', historyService);

    function historyService($log) {
        $log.log("historyService");
        var vm = this;

        vm.historyData = {};

        vm.setData = function(key, value) {
            vm.historyData[key] = value;
        };

        vm.getData = function(key) {
            if(vm.historyData.hasOwnProperty(key))
                return vm.historyData[key];

            return null;
        }
    }



})();