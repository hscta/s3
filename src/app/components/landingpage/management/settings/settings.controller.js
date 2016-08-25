/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('SettingsController', SettingsController);
    function SettingsController($scope, $rootScope, $log, $state, settingsService) {

        $log.log('SettingsController');
        var vm = this;

        vm.tabs = settingsService.displayTabs('group');

        vm.getSelectedIndex = function() {
            return settingsService.selectedTabIndex;
        }

    }
})();


