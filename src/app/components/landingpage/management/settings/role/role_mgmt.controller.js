/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, settingsService, startupData) {
        $log.log('RoleMgmtController');
        var vm = this;
      //  settingsService.setTab(intellicarAPI.constantFactory.ROLE);
        vm.data = [];


        vm.onLoad = function() {
            //$log.log("my startup data");
            $log.log(startupData);

            for ( var key in startupData ){
                vm.details = {};
                if (startupData.hasOwnProperty(key)) {
                    //$log.log(key + " -> " + startupData[key].name);
                    vm.details['name'] = startupData[key].name;
                    vm.details['id'] = startupData[key].roleid;
                    $log.log(vm.details);
                    vm.data.push(vm.details);
                    $scope = vm.data;
                }
            }
        };

        vm.onLoad();
    }
})();


