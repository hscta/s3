/**
 * Created by smiddela on 14/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('MapController', MapController);

    function MapController($scope, $rootScope, $log) {
        $log.log('MapController');
        var vm = this;
        var lat = 12.9176383;
        var lng = 77.6480335;

        vm.createMarker = function() {
            var latlng = new google.maps.LatLng(lat, lng);
            var marker = new google.maps.Marker({
                map: vm.inMap,
                position: latlng,
            });
        }

        vm.loadMap = function() {
            vm.inMap = { center: { latitude: lat, longitude: lng }, zoom: 12 };
            google.maps.event.addDomListener(window, "resize", function() {
                $log.log("resize map");
                vm.inMap = { center: { latitude: lat, longitude: lng }, zoom: 12 };
               // var center = vm.inMap.getCenter();
                google.maps.event.trigger(vm.inMap, "resize");
               // vm.inMap.setCenter(center);
            });
        }

        vm.options = {
            scrollwheel: false
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

        // $scope.$watch(function() {
        //     return vm.inMap.bounds;
        // }, function(nv, ov) {
        //     // Only need to regenerate once
        //     if (!ov.southwest && nv.southwest) {
        //         var markers = [];
        //         for (var i = 0; i < 50; i++) {
        //             markers.push(createRandomMarker(i, vm.inMap.bounds))
        //         }
        //         vm.randomMarkers = markers;
        //     }
        // }, true);

        vm.loadMap();
        //vm.createMarker();

        // vm.addSearchListener = function() {
        //     $log.log("addSearchListener");
        //     var mapSearchInput = document.getElementById('pac-input');
        //     if(mapSearchInput === null)
        //         return;
        //     var autocomplete = new google.maps.places.Autocomplete(mapSearchInput);
        //     autocomplete.bindTo('bounds', vm.centerMap);
        //     //var infowindowplacesearch = new google.maps.InfoWindow();
        //
        //     autocomplete.addListener('place_changed', function() {
        //         //infowindowplacesearch.close();
        //         var place = autocomplete.getPlace();
        //         if (!place.geometry) {
        //             return;
        //         }
        //
        //         // If the place has a geometry, then present it on a map.
        //         if (place.geometry.viewport) {
        //             vm.centerMap.fitBounds(place.geometry.viewport);
        //         } else {
        //             vm.centerMap.setCenter(place.geometry.location);
        //             vm.centerMap.setZoom(17);  // Why 17? Because it looks good.
        //         }
        //
        //         // infowindowplacesearch.setContent('<div><strong>' + place.name + '</strong>');
        //         // infowindowplacesearch.setPosition(place.geometry.location);
        //         // infowindowplacesearch.open(vm.centerMap);
        //         // $timeout(function(){infowindowplacesearch.close()}, 3000);
        //     });
        // };
        //
        // vm.resizeMap = function() {
        //     //$log.log("resizeMap");
        //     var mapDiv = $document[0].getElementById('map');
        //     if(mapDiv === null)
        //         return;
        //     google.maps.event.trigger(mapDiv, "resize");
        // };
        //
        // //$interval(vm.resizeMap, 1000);
        // vm.initMap();

    }
})();

