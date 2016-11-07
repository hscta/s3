/**
 * Created by smiddela on 05/11/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('RightNavMgmtController', RightNavMgmtController);

    function RightNavMgmtController($log, $scope, $timeout, rightNavMgmtService, intellicarAPI, $q) {
        $log.log("RightNavMgmtController");
        var vm = this;

        vm.init = function () {

        };


        vm.init();
    }
})();
