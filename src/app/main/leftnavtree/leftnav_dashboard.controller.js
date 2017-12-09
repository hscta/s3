/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    // .filter('trust', function ($sce) {
    //     return function (val) {
    //         return $sce.trustAsHtml(val);
    //     };
    // });

    function LeftNavDashboardController($scope, $rootScope, $log, intellicarAPI,
                                        leftNavDashboardService, $state, $filter) {

        $log.log('LeftNavDashboardController');
        var vm = this;
  

        vm.test = function () {
            console.log('clicked');
            //leftNavDashboardService.getVehicleInfo();
        };


        vm.init = function () {
            // leftNavDashboardService.getDashboardTree({})
            //     .then(vm.handleDashboardTree, vm.handleFailure);
            //vm.getMyVehicles();
        };

        vm.init();
    }
})();
