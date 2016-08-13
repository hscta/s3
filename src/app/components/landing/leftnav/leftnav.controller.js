/**
 * Created by smiddela on 13/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('LeftnavController', LeftnavController);

    function LeftnavController(navService, $mdSidenav, $log, $document, leftnavService, requestService) {

        $log.log('LeftnavController');
        var vm = this;
        var assetTree = {};

        vm.getTree = function() {
            assetTree = leftnavService.getTree();
            $log.log("assetTree");
            $log.log(assetTree);
        }

        vm.getTree();
    }
})();
