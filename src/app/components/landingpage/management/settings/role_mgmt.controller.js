/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('RoleMgmtController', RoleMgmtController);

    function RoleMgmtController($scope, $rootScope, $log, $state) {

        $log.log('RoleMgmtController');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);
    }
})();


