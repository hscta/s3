/**
 * Created by smiddela on 13/08/16.
 */

(function() {


    angular
        .module('uiplatform')
        .controller('RightnavController', RightnavController);

    function RightnavController(navService, $mdSidenav, $mdBottomSheet, $log, $q, $state,
                              $mdToast, $document, loginService, requestService) {

        $log.log('RightnavController');
        var vm = this;
    }
})();

