/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('UserMgmtController', UserMgmtController);

    function UserMgmtController($scope, $rootScope, $log, $state,
                                intellicarAPI, settingsService, startupData) {

        $log.log('UserMgmtController');
        var vm = this;
       // settingsService.setTab(intellicarAPI.constantFactory.USER);
        vm.data = [];

        vm.onLoad = function() {
            $log.log("my startup data");
            $log.log((startupData));
            vm.details = {};

            for ( var key in startupData ){
                vm.details = {};
                if (startupData.hasOwnProperty(key)) {
                    //$log.log(key + " -> " + startupData[key].name);
                    vm.details['name'] = startupData[key].name;
                    vm.details['id'] = startupData[key].userid;
                    $log.log(vm.details);
                    vm.data.push(vm.details);
                }
            }
        };

        vm.onLoad();
    }
})();


