/**
 * Created by harshas on 15/11/16.
 */


(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('roleService', roleService);

    function roleService ($log, requestService){

        var vm = this;

        vm.encloseBody = function (data) {
            // return data;
            return {role:data};
        };

        vm.assignPermission = function(body) {
            // $log.log("getMyGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/role/addpermission', body);
        };


        vm.createRole = function(body) {
            // $log.log("getMyGroups");
            body = vm.encloseBody(body);
            return requestService.firePost('/role/create', body);
        };


        vm.rolePermissions = function (body) {
            body = vm.encloseBody(body);
            return requestService.firePost('/role/permissions', body);
        };
    }
})();
