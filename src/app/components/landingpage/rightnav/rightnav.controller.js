/**
 * Created by smiddela on 13/08/16.
 */

(function() {


    angular
        .module('uiplatform')
        .controller('RightnavController', RightnavController);

    function RightnavController($scope,navService, $mdSidenav, $mdBottomSheet, $log, $q, $state,
                              $mdToast, $document, loginService, requestService) {

        $log.log('RightnavController');
        var vm = this;

        vm.toggleRightSidebar = function(event, data) {

            $log.log('dashboard navvvvvvvv ')
            vm.right_nav_toggle = data.right_nav_toggle;
        }

        $scope.$on('toggleRightSidebar', vm.toggleRightSidebar);
    }
})();

