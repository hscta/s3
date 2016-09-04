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

            $log.log('stateChangeStart =================');
            $log.log(toParams);

            if(leafState != intellicarAPI.appConstants.GROUP || ('tabClick' in toParams)) {
                //$log.log(leafState);
                for (var idx in vm.tabs) {
                    if (leafState == vm.tabs[idx]) {
                        //$log.log("selectedTab = " + vm.selectedTab);
                        vm.selectedTab = idx;
                        break;
                    }
                }
            } else {
                $log.log('my to is group state ' + vm.tabs[vm.selectedTab]);
                if(!('tabClick' in toParams)) {
                    if (vm.tabs[vm.selectedTab] != intellicarAPI.appConstants.GROUP) {
                        // $log.log("my toParams");
                        // $log.log(toParams);
                        // $log.log("my to yahoo");
                        var dstState = intellicarAPI.stateService.getStateTree(toState.name).parent +
                            intellicarAPI.stateService.dotState(vm.tabs[vm.selectedTab]);
                        // $log.log("my to after");
                        event.preventDefault();
                        $state.go(dstState, toParams);
                    }
                }
            }
        });


        vm.tabClick = function(assetType) {
            var currentGroup = settingsService.getCurrentGroup();

            if(currentGroup == null)
                return;
            //$log.log("my to current state: " + assetType);
            $log.log(currentGroup);
            var stateParams = {
                info: {
                    pgrouppath: currentGroup.group.grouppath,
                    //grouppath: currentGroup.group.grouppath,
                    assetpath: currentGroup.group.grouppath,
                    ui_asset_type: assetType,
                    tabClick: true
                }
            };
            // $log.log(stateParams);
            // $log.log("my asset type " + assetType);

            $state.go(vm.getTabState(assetType), stateParams);
        };

        vm.setTab = function(tabIndex) {
            vm.selectedTab = tabIndex;
        };

        vm.init = function() {
            settingsService.addSetTabListener(vm.setTab);
        };

        vm.init();
    }
})();


