/**
 * Created by smiddela on 15/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('LeftNavManagementController', LeftNavManagementController);

    function LeftNavManagementController($rootScope,$scope, $log, startupData,groupService,
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

        vm.handleResponse = function (data) {
            //$log.log("handleResponse");
            vm.tree_data = data;
            return vm.tree_data;
        };


        vm.handleResponseFailure = function (data) {
            $log.log("handleResponseFailure");
            $log.log(data);
        };

        vm.firedgrouppaths = [];

        vm.initialize = function (data) {
            vm.firedgrouppaths.push(startupData);
            leftNavManagementService.getManagementTreeWithUser({grouppath:startupData})
                .then(vm.handleResponse, vm.handleResponseFailure)
                .then(vm.setFirstGroup, vm.handleResponseFailure);
        };

        vm.setFirstGroup = function(resp){
            groupService.lastGroupPath = resp[0].info.assetpath;
            settingsService.lastGroup = resp[0].info;
        };

        vm.handleAssetClick = function (asset, collapsed, toggle, obj) {
            $log.log('handle asset click', collapsed);
            if (!collapsed) {
                toggle(obj);
            }

            if(!asset.ui_asset_type && asset.info.ui_asset_type === 'group') {
                vm.selectedAsset = asset.id;
                asset.loading = true;
                groupService.lastGroupPath = asset.info.assetpath;
                settingsService.lastGroup = asset.info;

                if (asset.info.assetpath == '/1/1') {
                    leftNavManagementService.getManagementTreeWithUser({grouppath: asset.info.assetpath})
                        .then(vm.handleResponse, vm.handleResponseFailure);
                } else {
                    leftNavManagementService.getManagementTree({grouppath: asset.info.assetpath})
                        .then(vm.handleResponse, vm.handleResponseFailure);
                }
            }

            settingsService.handleAssetClick(asset);
        };


        vm.expand_tree = function () {
            $log.log('expand');
            // $scope.$broadcast('angular-ui-tree:collapse-all');
            var duplicateTree;

            // if ( vm.tree_search_pattern === '' )
            //     angular.copy(duplicateTree, vm.tree_data);
            // else {
            //     angular.copy(vm.tree_data, duplicateTree);
            // }
            vm.filterTree(vm.tree_data);

        };


        vm.filterTree = function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].collapsed = true;

                if (data[i].items.length)
                    vm.filterTree(data[i].items)
            }
        };


        vm.toggleLeftSidebar = function(event, data) {
            if ( data.left_nav_toggle) {
                document.getElementById("myLeftSidenav").style.width = "320px";
                document.getElementById("main").style.marginLeft = "320px";
            } else{
                document.getElementById("myLeftSidenav").style.width = "0";
                document.getElementById("main").style.marginLeft= "0";
            }
        };

        // vm.expandAll = function () {
        //     if ( vm.tree_search_pattern.length <= 0 ){
        //         $scope.$broadcast('angular-ui-tree:expand-all');
        //         $log.log('Expanddddddddddddd')
        //
        //     } else {
        //         $scope.$broadcast('angular-ui-tree:expand-all');
        //         $log.log('Collapseeeeeeeeeeeeeee');
        //     }
        // };

        vm.initialize();

        $scope.$on('toggleLeftSidebar', vm.toggleLeftSidebar);

        $scope.$on('EVENT_MGMT_TREE_CHANGE', vm.initialize);
    }

})();


// vm.toggleCheck = function (item) {
//     $log.log("checkStatus = " + item.checkStatus);
//     if (item.checkStatus === "checked") {
//         item.checkStatus = "unchecked";
//     } else {
//         item.checkStatus = "checked";
//     }
//
//     if (item.items && item.items.length)
//         vm.propagateCheckFromParent(item.items, item.checkStatus);
//
//     vm.verifyAllParentsCheckStatus(vm.tree_data);
// };
//
// vm.propagateCheckFromParent = function (items, status) {
//     for (var i = 0; i < items.length; ++i) {
//         var item = items[i];
//         item.checkStatus = status;
//         if (item.items)
//             vm.propagateCheckFromParent(item.items, status)
//     }
// };
//
// vm.verifyAllParentsCheckStatus = function (items) {
//     var retVal = "";
//     for (var i = 0; i < items.length; ++i) {
//         var item = items[i];
//         $log.log(item);
//         if (item.items && item.items.length) {
//             item.checkStatus = vm.verifyAllParentsCheckStatus(item.items);
//         }
//         if (retVal === "") {
//             retVal = item.checkStatus;
//             // console.log("set ret");
//         }
//         if (retVal != item.checkStatus)
//             return "partlyChecked";
//
//     }
//     return retVal;
// };
