/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
        .controller('Tab1Controller', Tab1Controller);

    function Tab1Controller($scope, $rootScope, $log, $state) {

        $log.log('Tab1Controller');
        var vm = this;

        $log.log('state.name = ');
        $log.log($state);
    }
})();


