/**
 * Created by smiddela on 14/08/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('MainMapController', MainMapController);

    function MainMapController($scope, $rootScope, navService, $mdSidenav, $log, $document,
                           $timeout, leftnavService, $interval, requestService) {
        $log.log('MainMapController');
        var vm = this;

        vm.initMap = function () {
            var defaultCenter = [12.9176383, 77.6480335];
            var lat = defaultCenter[0];
            var lng = defaultCenter[1];
            var myLatLng = new google.maps.LatLng(lat, lng);
            var mapOptions = {zoom: 13, center: myLatLng, mapTypeId: google.maps.MapTypeId.ROADMAP, heading: 90};

            $log.log(myLatLng);
            vm.centerMap = new google.maps.Map($document[0].getElementById('mainmap'), mapOptions);
            //$log.log(vm.centerMap);
            vm.addSearchListener();
        };

        vm.addSearchListener = function() {
            $log.log("addSearchListener");
            var input = (document.getElementById('pac-input'));
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', vm.centerMap);
            //var infowindowplacesearch = new google.maps.InfoWindow();

            autocomplete.addListener('place_changed', function() {
                //infowindowplacesearch.close();
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    vm.centerMap.fitBounds(place.geometry.viewport);
                } else {
                    vm.centerMap.setCenter(place.geometry.location);
                    vm.centerMap.setZoom(17);  // Why 17? Because it looks good.
                }

                // infowindowplacesearch.setContent('<div><strong>' + place.name + '</strong>');
                // infowindowplacesearch.setPosition(place.geometry.location);
                // infowindowplacesearch.open(vm.centerMap);
                // $timeout(function(){infowindowplacesearch.close()}, 3000);
            });
        };

        vm.resizeMap = function() {
            $log.log("resizeMap");
            google.maps.event.trigger(document.getElementById('mainmap'), "resize");
        };

        $interval(vm.resizeMap, 500);
        vm.initMap();
    }
})();

