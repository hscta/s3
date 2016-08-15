/**
 * Created by smiddela on 15/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($scope,$rootScope, navService, $mdSidenav, $log, $document, leftnavService, requestService) {

        $log.log('LeftNavDashboardController');
        var vm = this;


        vm.toggleLeftnav = function(event, data) {

            $log.log('dashboard navvvvvvvv ')
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftnav', vm.toggleLeftnav);


    }
})();
