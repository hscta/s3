/**
 * Created by smiddela on 15/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('SettingsController', SettingsController);
    function SettingsController($scope, $rootScope, $log, $state,
                                settingsService, intellicarAPI) {

        $log.log('SettingsController');
        var vm = this;

        vm.tabs = settingsService.tabs;

        vm.getTabState = function (assetType) {
            return "home.management." + assetType;
        };


        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            //$log.log("from state = " + fromState.name);
            //$log.log("to state = " + toState.name);
            var leafState = intellicarAPI.stateService.getStateTree(toState.name).leaf;
            var parentState = intellicarAPI.stateService.getStateTree(toState.name).parent;

            if(parentState == intellicarAPI.stateService.STATE_HOME_MANAGEMENT) {
                //$log.log(leafState);
                for (var idx in vm.tabs) {
                    if (leafState == vm.tabs[idx]) {
                        //$log.log("selectedTab = " + vm.selectedTab);
                        vm.selectedTab = idx;
                        break;
                    }
                }
            }
        });

    }
})();


