/**
 * Created by smiddela on 15/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('LeftNavManagementController', LeftNavManagementController)

    function LeftNavManagementController($scope, $rootScope, $log, intellicarAPI,
                                         leftNavManagementService, $state, $filter,
                                         settingsService) {

        $log.log('LeftNavManagementController');
        var vm = this;
        vm.state = $state;
        vm.tree_search_pattern = '';
        vm.search_results;

        $scope.treeFilter = $filter('uiTreeFilter');

        vm.availableFields = ['title', 'description'];
        vm.supportedFields = ['title', 'description'];

        vm.getMyVehicles = function (data) {
            //$log.log("getMyVehicles");
            //$log.log(data);
            vm.tree_data = data;
        };

        vm.getMyVehiclesFailure = function (data) {
            $log.log("getMyVehiclesFailure");
            $log.log(data);
        };

        vm.addAllListeners = function () {
        };

        // vm.buttonClick = function (item) {
        //     $log.log("buttonClick" + item);
        //     $state.transitionTo('home.management.vehicle' + item, {some: "data"});
        // };

        vm.toggleCheck = function (item) {
            $log.log("checkStatus = " + item.checkStatus);
            if (item.checkStatus === "checked") {
                item.checkStatus = "unchecked";
            } else {
                item.checkStatus = "checked";
            }

            if (item.items && item.items.length)
                vm.propagateCheckFromParent(item.items, item.checkStatus);

            vm.verifyAllParentsCheckStatus(vm.tree_data);
        };

        vm.propagateCheckFromParent = function (items, status) {
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                item.checkStatus = status;
                if (item.items)
                    vm.propagateCheckFromParent(item.items, status)
            }
        };

        vm.verifyAllParentsCheckStatus = function (items) {
            var retVal = "";
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                $log.log(item);
                if (item.items && item.items.length) {
                    item.checkStatus = vm.verifyAllParentsCheckStatus(item.items);
                }
                if (retVal === "") {
                    retVal = item.checkStatus;
                    // console.log("set ret");
                }
                if (retVal != item.checkStatus)
                    return "partlyChecked";

            }
            return retVal;
        };


        vm.initialize = function () {
            leftNavManagementService.getManagementTree({})
                .then(vm.getMyVehicles, vm.getMyVehiclesFailure);
        };

        vm.test = function (asset, collapsed, toggle, obj) {
            // var tab = "group";
            // //$rootScope.$broadcast('test', {'info':asset});
            // if(settingsService.tabs.indexOf(asset.id) != -1) {
            //     tab = asset.id;
            // } else {
            //     tab = asset.info.ui_asset_type;
            // }
            //
            // settingsService.setTabStateData(tab, asset);
            //
            // var tabState = intellicarAPI.stateService.STATE_HOME_MANAGEMENT_DOT + tab;
            //
            // //$log.log(asset.info);
            // $state.go(tabState, asset);
            //

            if ( !collapsed ){
                toggle(obj);
            }

            $log.log("my to before handleSelection");
            settingsService.handleSelection(asset);
        }

        vm.expand_tree = function () {
            $log.log('expand');
            $scope.$broadcast('angular-ui-tree:collapse-all');

        }


        vm.addAllListeners();
        vm.initialize();
    }

})();
