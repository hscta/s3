/**
 * Created by smiddela on 21/08/16.
 */


(function () {

    angular
        .module('uiplatform')
        .controller('GroupMgmtController', GroupMgmtController);

    function GroupMgmtController($scope, $rootScope, $log,
                                 intellicarAPI, groupMgmtService,
                                 settingsService, startupData) {

        $log.log('GroupMgmtController');
        settingsService.setTab(intellicarAPI.appConstants.GROUP);
        var vm = this;
        vm.assets = [];
        vm.newGroupName = '';
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

            if ( settingsService.getCurrentGroup().group.grouppath )
                vm.showBtn = true;
        };

        vm.createGroup = function () {
            groupMgmtService.createGroup(vm.newGroupName)
                .then(function (resp) {
                        $log.log(resp);
                        $rootScope.$broadcast('EVENT_MGMT_TREE_CHANGE', {});
                    },
                    function (resp) {
                        $log.log("CREATE GROUP FAILED");
                        $log.log(resp)
                    });
        };

        vm.showNewGroupField = function () {
            $log.log('show/hide');
            vm.isdiplay = !vm.isdiplay;
        };

        vm.onLoad();
    }
})();


