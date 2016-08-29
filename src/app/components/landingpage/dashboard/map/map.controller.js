/**
 * Created by smiddela on 14/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('MapController', MapController);

    function MapController($scope, $rootScope, $log, mapService, $timeout) {
        $log.log('MapController');
        var vm = this;
        vm.randomMarkers = [];

        vm.loadMap = function() {
            vm.inMap = {};
            vm.inMap.zoom = mapService.getZoom();
            vm.inMap.center = mapService.getCenter();
            vm.inMap.bounds = mapService.getBounds();
            vm.marker = mapService.getMarker();
        };

        vm.updateZoom = function() {
            vm.inMap.zoom = mapService.getZoom();
            $timeout(vm.updateZoom, 4000);
        };

        vm.options = {
            //scrollwheel: false
        };

        vm.updateMarker = function (msg) {
            // $log.log('mapController updateMarker');
            $log.log(msg);

            if(vm.randomMarkers.length < 2) {
                vm.randomMarkers.push(msg);
            }

            for(var idx in vm.randomMarkers) {
                var marker = vm.randomMarkers[idx];
                if(marker.id == msg.id) {
                    msg.title = 'mypath: ' + msg.id;
                    vm.randomMarkers[idx] = msg;
                }
            }
        };

        vm.addListener = function () {
            mapService.addMsgListener(vm.updateMarker);
        };

        vm.loadMap();
        vm.addListener();

        // var createRandomMarker = function(i, bounds, idKey) {
        //     var lat_min = bounds.southwest.latitude,
        //         lat_range = bounds.northeast.latitude - lat_min,
        //         lng_min = bounds.southwest.longitude,
        //         lng_range = bounds.northeast.longitude - lng_min;
        //
        //     if (idKey == null) {
        //         idKey = "id";
        //     }
        //
        //     var latitude = lat_min + (Math.random() * lat_range);
        //     var longitude = lng_min + (Math.random() * lng_range);
        //     var ret = {
        //         latitude: latitude,
        //         longitude: longitude,
        //         title: 'm' + i
        //     };
        //     ret[idKey] = i;
        //     return ret;
        // };


        // //vm.randomMarkers = {};
        // // Get the bounds from the map once it's loaded
        // $scope.$watch(function() {
        //     return vm.inMap.bounds;
        // }, function(nv, ov) {
        //     // Only need to regenerate once
        //     if (!ov.southwest && nv.southwest) {
        //         var markers = [];
        //         //var markers = {};
        //         for (var i = 0; i < 50; i++) {
        //             markers.push(createRandomMarker(i, vm.inMap.bounds))
        //             //markers[i] = createRandomMarker(i, vm.inMap.bounds);
        //         }
        //         vm.randomMarkers = markers;
        //     }
        // }, true);

        //vm.updateZoom();
    }
})();

