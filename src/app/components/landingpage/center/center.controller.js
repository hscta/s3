/**
 * Created by smiddela on 14/08/16.
 */

/**
 * Created by smiddela on 13/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('CenterController', CenterController);

    function CenterController($scope, $rootScope, navService, $mdSidenav, $log, $document, leftnavService, requestService) {
        $log.log('CenterController');
        var vm = this;
    }
})();

