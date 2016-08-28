/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('GroupMgmtController', GroupMgmtController);

    function GroupMgmtController($scope, $rootScope, $log,
                                 $state, $location, $mdExpansionPanel,
                                 intellicarAPI, settingsService,
                                 startupData) {

        $log.log('GroupMgmtController');
        var vm = this;
        settingsService.setTab(intellicarAPI.constantFactory.GROUP);



        vm.handleMyVehicles = function(data) {
            $log.log("GroupMgmtController handleMyVehicles");
            $log.log(data);

            vm.data = data;
        };


        vm.handleMyVehiclesFailure = function(data) {
            $log.log("GroupMgmtController handleMyVehiclesFailure");
        };


        vm.toggle_on_panel = function (myfunc) {
            $log.log('click event');
            myfunc();
        };

        vm.test = function(event, data) {
            vm.info = data.info;
            $log.log(vm.info);

            $location.hash('bottom');

            // call $anchorScroll()
           // anchorSmoothScrollService.scrollTo('sss');
            intellicarAPI.anchorScrollService.scrollTo('sss');
            $mdExpansionPanel().waitFor('panell').then(function (instance) {
                instance.expand();
            });
        };

        $scope.$on('test', vm.test);

        vm.onLoad = function() {
            //$log.log("my startup data");
            $log.log(startupData);
        };

        vm.onLoad();
    }
})();


