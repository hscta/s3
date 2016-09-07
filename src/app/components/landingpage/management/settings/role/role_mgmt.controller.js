/**
 * Created by smiddela on 21/08/16.
 */



(function () {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, settingsService, startupData, $mdExpansionPanelGroup) {
        $log.log('RoleMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.appConstants.ROLE);
        vm.data = [];


        vm.onLoad = function () {
            $log.log("my role data");
            $log.log(startupData);

            var i = 0;
            for (var key in startupData) {
                vm.details = {};
                if (startupData.hasOwnProperty(key)) {
                    //$log.log(key + " -> " + startupData[key].name);
                    vm.details['name'] = startupData[key].name;
                    //vm.details['id'] = startupData[key].roleid;
                    vm.details['id'] = startupData[key].assetid;
                    vm.details['len'] = i++;
                    $log.log(vm.details);
                    vm.data.push(vm.details);
                    $scope = vm.data;
                }
            }
        };
        vm.createPanel = function () {
            var details = {};
            details.len = vm.data.length;
            details.name = "new" + vm.data.length;
            vm.data.unshift(details);
        };

        vm.onLoad();
    }
})();


