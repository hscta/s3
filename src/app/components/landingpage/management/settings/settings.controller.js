/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('SettingsController', SettingsController);

    function SettingsController($scope, $rootScope, $log) {

        $log.log('SettingsController');
        var vm = this;

        vm.toggleLeftnav = function(event, data) {
            $log.log('management navvvvvvvv ')
            vm.left_nav_toggle = data.left_nav_toggle;
        }

    }
})();


