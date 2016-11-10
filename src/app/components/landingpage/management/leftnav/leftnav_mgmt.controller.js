/**
 * Created by smiddela on 15/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('LeftNavManagementController', LeftNavManagementController);

    function LeftNavManagementController($rootScope,$scope, $log,
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
            // $log.log(data);
            vm.tree_data = data;
        };


        vm.handleResponseFailure = function (data) {
            $log.log("handleResponseFailure");
            $log.log(data);
        };


        vm.initialize = function (data) {
            $log.log("vm.initialize");
            leftNavManagementService.getManagementTree({})
                .then(vm.handleResponse, vm.handleResponseFailure);
        };


        vm.handleAssetClick = function (asset, collapsed, toggle, obj) {
            if (!collapsed) {
                toggle(obj);
            }
            settingsService.handleAssetClick(asset);
        };


        vm.expand_tree = function () {
            $log.log('expand');
           // $scope.$broadcast('angular-ui-tree:collapse-all');
            // if ( vm.tree_search_pattern === '' )
            //     angular.copy(duplicateTree, vm.tree_data);
            // else {
            //     angular.copy(vm.tree_data, duplicateTree);
            // }
           // vm.filterTree(vm.tree_data);

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
