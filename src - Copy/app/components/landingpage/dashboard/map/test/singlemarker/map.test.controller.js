/**
 * Created by smiddela on 14/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('MapTestController', MapTestController);

    function MapTestController($scope, $rootScope, $log, mapTestService, $timeout) {
        $log.log('MapTestController');
        var vm = this;

        vm.loadMap = function() {
            vm.inMap = {};
            vm.inMap.zoom = mapTestService.getZoom();
            vm.inMap.center = mapTestService.getCenter();
            vm.marker = mapTestService.getMarker();
        }

        vm.updateZoom = function() {
            vm.inMap.zoom = mapTestService.getZoom();
            $timeout(vm.updateZoom, 4000);
        }

        vm.loadMap();
        vm.updateZoom();
    }
})();

