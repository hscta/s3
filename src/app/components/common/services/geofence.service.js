/**
 * Created by smiddela on 28/09/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('geofenceService', geofenceService);

    function geofenceService($log, $q, requestService, helperService) {
        var vm = this;
        $log.log("geofenceService");


        vm.getFenceInfo = function (body) {
            var reqbody = {geofence: body};
            return requestService.firePost('/geofence/info', reqbody);
        };


        // vm.mergeAssetData = function (resp) {
        //     //$log.log(resp);
        //     if(resp.data  && resp.data.data) {
        //         var asset = resp.data.data.asset[0];
        //         asset.info = resp.data.data.info;
        //         asset.assg = resp.data.data.assg;
        //         asset.assginfo = resp.data.data.assginfo;
        //         asset.permissions = resp.data.data.permissions;
        //         //$log.log(asset);
        //         return asset;
        //     }
        //
        //     return $q.reject(resp);
        // };


        vm.getFenceInfoMap = function (body) {
            return vm.getFenceInfo(body)
                //.then(vm.mergeAssetData, vm.handleFailure);
                .then(helperService.mergeAssetAssignments, vm.handleFailure);
        };
    }

})();