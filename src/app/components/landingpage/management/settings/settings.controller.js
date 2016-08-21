/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('SettingsController', SettingsController);

    function SettingsController($scope, $rootScope, $log, $state) {

        $log.log('SettingsController');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);
    }
})();


