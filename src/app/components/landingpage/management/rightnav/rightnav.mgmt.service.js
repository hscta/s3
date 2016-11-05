/**
 * Created by smiddela on 05/11/16.
 */


(function () {
    angular
        .module('uiplatform')
        .service('rightNavMgmtService', rightNavMgmtService);

    function rightNavMgmtService($log, $scope, $timeout, intellicarAPI, $q) {
        $log.log("rightNavMgmtService");
        var vm = this;

        vm.init = function () {

        };


        vm.init();
    }
})();
