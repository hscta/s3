/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('VehicleMgmtController', VehicleMgmtController);

    function VehicleMgmtController($scope, $rootScope, $log, $state) {
        $log.log('VehicleMgmtController');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);

        vm.onLoad = function() {
        }

        vm.onLoad();
    }
})();


