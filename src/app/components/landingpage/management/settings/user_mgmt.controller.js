/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('UserMgmtController', UserMgmtController);

    function UserMgmtController($scope, $rootScope, $log, $state) {

        $log.log('UserMgmtController');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);
    }
})();


