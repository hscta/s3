/**
 * Created by smiddela on 15/08/16.
 */

(function () {

    angular
        .module('uiplatform')
        .controller('LeftNavManagementController', LeftNavManagementController)

    function LeftNavManagementController($scope, $rootScope, $log, intellicarAPI,
                                         leftNavManagementService, $state) {

        $log.log('LeftNavManagementController');
        var vm = this;
        vm.state = $state;

        vm.availableFields = ['title', 'description'];
        vm.supportedFields = ['ti   tle', 'description'];

        vm.getMyVehicles = function (data) {
            //$log.log("getMyVehicles");
            $log.log(data);
            vm.tree_data = data;
        };

        vm.getMyVehiclesFailure = function (data) {
            $log.log("getMyVehiclesFailure");
            $log.log(data);
        };

        vm.addAllListeners = function () {
        };

        vm.buttonClick = function (item) {
            $log.log("buttonClick" + item);
            $state.transitionTo('home.management.tab' + item, {some: "data"});
        };

        vm.toggleCheck = function (node) {
            $log.log("checkStatus = " + node.checkStatus);
            if (node.checkStatus === "checked") {
                node.checkStatus = "unchecked";
            } else {
                node.checkStatus = "checked";
            }

            if (node.nodes.length)
                vm.propagateCheckFromParent(node.nodes, node.checkStatus);

            vm.verifyAllParentsCheckStatus(vm.tree_data);
        };

        vm.propagateCheckFromParent = function (nodes, status) {
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                node.checkStatus = status;
                if (node.nodes)
                    vm.propagateCheckFromParent(node.nodes, status)
            }
        };

        vm.verifyAllParentsCheckStatus = function (nodes) {
            var retVal = "";
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                $log.log(node);
                if (node.nodes.length) {
                    node.checkStatus = vm.verifyAllParentsCheckStatus(node.nodes);
                }
                if (retVal === "") {
                    retVal = node.checkStatus;
                    // console.log("set ret");
                }
                if (retVal != node.checkStatus)
                    return "partlyChecked";

            }
            return retVal;
        };


        vm.initialize = function () {
            leftNavManagementService.getTreeMyVehicles({})
                .then(vm.getMyVehicles, vm.getMyVehiclesFailure);
        };


        vm.addAllListeners();
        vm.initialize();
    }

})();
