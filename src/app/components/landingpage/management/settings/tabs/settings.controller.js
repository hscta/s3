/**
 * Created by smiddela on 15/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('SettingsController', SettingsController);
    function SettingsController($scope, $rootScope, $log, $state, settingsService) {

        $log.log('SettingsController');
        var vm = this;

        vm.tabs = settingsService.tabs;

        vm.getTabState = function (assetType) {
            return "home.management." + assetType;
        };


        vm.getLeafState = function (absoluteState) {
            if (absoluteState === null)
                return null;

            var startIndex = absoluteState.lastIndexOf('.');
            if (startIndex == -1) {
                return absoluteState;
            }

            return absoluteState.substring(startIndex + 1);
        };


        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            //$log.log("from state = " + fromState.name);
            //$log.log("to state = " + toState.name);
            var leafState = vm.getLeafState(toState.name);
            //$log.log(leafState);
            for (var idx in vm.tabs) {
                if (leafState == vm.tabs[idx]) {
                    //$log.log("selectedTab = " + vm.selectedTab);
                    vm.selectedTab = idx;
                    break;
                }
            }
        });

    }
})();


