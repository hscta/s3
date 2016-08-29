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
            //$log.log(intellicarAPI.stateService.STATE_HOME_MANAGEMENT_DOT + assetType);
            return intellicarAPI.stateService.STATE_HOME_MANAGEMENT_DOT + assetType;
        };


        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            //$log.log("from state = " + fromState.name);
            //$log.log("to state = " + toState.name);
            var leafState = intellicarAPI.stateService.getStateTree(toState.name).leaf;
            //var parentState = intellicarAPI.stateService.getStateTree(toState.name).parent;

            //$log.log(leafState);
            for (var idx in vm.tabs) {
                if (leafState == vm.tabs[idx] && ( leafState != 'group')) {
                    //$log.log("selectedTab = " + vm.selectedTab);
                    vm.selectedTab = idx;
                    break;
                }
            }
        });


        vm.tabClick = function(assetType) {
            var currentGroup = settingsService.getCurrentGroup();
            $log.log("my current group");
            $log.log(currentGroup);
            var stateParams = {
                info: {
                    pgrouppath: currentGroup.group.grouppath
                },
                id:'123'
            };
            $log.log(stateParams);
            $log.log("my asset type " + assetType);
            if(assetType != 'group') {
                $state.go(vm.getTabState(assetType), stateParams);
            }
        }
        // vm.setTab = function(tabIndex) {
        //     vm.selectedTab = tabIndex;
        // };
        //
        // vm.init = function() {
        //     settingsService.addSetTabListener(vm.setTab);
        // };

       // vm.init();
    }
})();


