/**
 * Created by smiddela on 13/08/16.
 */

(function() {


    angular
        .module('uiplatform')
        .controller('RightnavController', RightnavController);

    function RightnavController($scope, $rootScope, $log) {

        $log.log('RightnavController');
        var vm = this;

        vm.toggleRightSidebar = function(event, data) {
            $log.log('dashboard nav ')
            vm.right_nav_toggle = data.right_nav_toggle;
        }

        $scope.$on('toggleRightSidebar', vm.toggleRightSidebar);
    }
})();

