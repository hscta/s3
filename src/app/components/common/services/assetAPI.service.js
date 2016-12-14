/**
 * Created by smiddela on 14/12/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('assetAPIService', assetAPIService);

    function assetAPIService($rootScope, $log, $q, requestService, helperService) {
        $log.log("assetAPIService");
        var vm = this;

        vm.encloseBody = function (data) {
            return {asset: data};
        };


        vm.getMyAssets = function (body, assettype) {
            body.assettype = assettype;

            if(!('grouppath' in body)) {
                body.grouppath = '/1/1';
            }
            
            body = vm.encloseBody(body);
            return requestService.firePost('/asset/myassets', body);
        };


        vm.getMyGroups = function(body) {
            return vm.getMyAssets(body, appConstants.GROUP);
        };


        vm.getMyUsers = function(body) {
            return vm.getMyAssets(body, appConstants.USER);
        };


        vm.getMyRoles = function(body) {
            return vm.getMyAssets(body, appConstants.ROLE);
        };


        vm.getMyVehicles = function(body) {
            return vm.getMyAssets(body, appConstants.VEHICLE);
        };


        vm.getMyDevices = function(body) {
            return vm.getMyAssets(body, appConstants.DEVICE);
        };
    }

})();