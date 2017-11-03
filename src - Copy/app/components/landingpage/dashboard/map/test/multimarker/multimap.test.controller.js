/**
 * Created by smiddela on 14/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('MultiMapTestController', MultiMapTestController);

    function MultiMapTestController($scope, $rootScope, $log, multiMapTestService, $timeout) {
        $log.log('MultiMapTestController');
        var vm = this;

        vm.loadMap = function() {
            vm.inMap = {};
            vm.inMap.zoom = multiMapTestService.getZoom();
            vm.inMap.center = multiMapTestService.getCenter();
            vm.inMap.bounds = multiMapTestService.getBounds();
            vm.marker = multiMapTestService.getMarker();
        }

        vm.updateZoom = function() {
            vm.inMap.zoom = multiMapTestService.getZoom();
            $timeout(vm.updateZoom, 4000);
        }

        vm.options = {
            //scrollwheel: false
        };

        var createRandomMarker = function(i, bounds, idKey) {
            var lat_min = bounds.southwest.latitude,
                lat_range = bounds.northeast.latitude - lat_min,
                lng_min = bounds.southwest.longitude,
                lng_range = bounds.northeast.longitude - lng_min;

            if (idKey == null) {
                idKey = "id";
            }

            var latitude = lat_min + (Math.random() * lat_range);
            var longitude = lng_min + (Math.random() * lng_range);
            var ret = {
                latitude: latitude,
                longitude: longitude,
                title: 'm' + i
            };
            ret[idKey] = i;
            return ret;
        };

        vm.randomMarkers = [];
        // Get the bounds from the map once it's loaded
        $scope.$watch(function() {
            return vm.inMap.bounds;
        }, function(nv, ov) {
            // Only need to regenerate once
            if (!ov.southwest && nv.southwest) {
                var markers = [];
                for (var i = 0; i < 50; i++) {
                    markers.push(createRandomMarker(i, vm.inMap.bounds))
                }
                vm.randomMarkers = markers;
            }
        }, true);

        vm.loadMap();
        //vm.updateZoom();
    }
})();

