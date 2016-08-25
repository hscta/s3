/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('DeviceMgmtController', DeviceMgmtController);

    function DeviceMgmtController($scope, $rootScope, $log, $state) {

        $log.log('DeviceMgmtController');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);
    }
})();


