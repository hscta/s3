/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('ManagementController', ManagementController);

    function ManagementController($scope, $state,$rootScope, navService, $mdSidenav,
                                  $log, $document, requestService) {

        $log.log('ManagementController');
        var vm = this;

        vm.toggleLeftnav = function(event, data) {
            $log.log('management navvvvvvvv ')
            vm.left_nav_toggle = data.left_nav_toggle;
        }

    }
})();


