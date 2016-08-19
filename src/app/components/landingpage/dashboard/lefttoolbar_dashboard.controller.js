/**
 * Created by smiddela on 15/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('LeftToolbarDashboardController', LeftToolbarDashboardController);

    function LeftToolbarDashboardController($scope, $rootScope, navService, $mdSidenav,
                                            $log, $document, leftNavDashboardService, requestService) {
        $log.log('LeftToolbarDashboardController');
        var vm = this;
    }
})();


