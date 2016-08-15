/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($scope, $rootScope, navService, $mdSidenav, $log, $document, leftnavService, requestService) {

        $log.log('LeftNavDashboardController');
        var vm = this;
    }
})();


