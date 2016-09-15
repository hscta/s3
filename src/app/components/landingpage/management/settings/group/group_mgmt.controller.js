/**
 * Created by smiddela on 21/08/16.
 */


(function () {

    angular
        .module('uiplatform')
        .controller('GroupMgmtController', GroupMgmtController);

    function GroupMgmtController($scope, $rootScope, $log,
                                 intellicarAPI, groupMgmtService,
                                 settingsService, startupData, $q) {

        $log.log('GroupMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.GROUP);
        var vm = this;
        vm.assets = [];
        vm.newGroup = {};
        vm.groupBtnStatus = false;
        vm.isdiplay = false;
        vm.showBtn = false;

        vm.handleMyVehiclesFailure = function (data) {
            $log.log("GroupMgmtController handleMyVehiclesFailure");
        };

        vm.onLoad = function () {
            $log.log(startupData);
            vm.assets = [];
            for (var key in startupData) {
                vm.assets.push(startupData[key]);
            }
            $log.log(vm.assets);

            if ( settingsService.getCurrentGroupPath() )
                vm.showBtn = true;
        };

        vm.createGroup = function () {
            vm.groupBtnStatus = true;
            groupMgmtService.createGroup(vm.newGroup)
                .then(function (resp) {
                        $log.log(resp);
                        vm.newGroup = {};
                        $rootScope.$broadcast('EVENT_MGMT_TREE_CHANGE', {});
                        vm.groupBtnStatus = false;
                        vm.msg = "Group created Successfully."
                        vm.group = $q.resolve(resp.data.data);
                    $log.log(resp);
                    $log.log(vm.group);
                    },
                    function (resp) {
                        $log.log("CREATE GROUP FAILED");
                        $log.log(resp);
                        vm.groupBtnStatus = false;
                        vm.msg = "Failed to create group."
                    });
        };

        vm.showNewGroupField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
            vm.msg = ""
        };

        vm.onLoad();
    }
})();


