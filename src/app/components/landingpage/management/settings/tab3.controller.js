/**
 * Created by smiddela on 21/08/16.
 */



(function() {

    angular
        .module('uiplatform')
        .controller('Tab3Controller', Tab3Controller);

    function Tab3Controller($scope, $rootScope, $log, $state) {

        $log.log('Tab3Controller');
        var vm = this;

        $log.log('state.name = ');
        $log.log($state);
    }
})();


