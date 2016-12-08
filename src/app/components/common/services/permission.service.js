/**
 * Created by harshas on 14/11/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('permissionService', permissionService);

    function permissionService($log, requestService) {
        $log.log("groupService");
        var vm = this;

        vm.permissionMap = function(body) {
            // $log.log("getMyGroups");
            return requestService.firePost('/permission/map', body);
        };

    }

})();
