(function () {
    'use strict';

    angular.module('uiplatform')
        .service('customMapOverlay', customMapOverlay);

    function customMapOverlay($log) {
        var vm = this;

        var innerHtml;

        vm.CustomMarker = function(lat, lng, map, args) {
            this.latlng = new google.maps.LatLng(lat,lng);
            this.args = args;
            this.setMap(map);

            this.setPosition = function(obj){
                this.latlng = new google.maps.LatLng(obj.latitude,obj.longitude);
                this.point = this.getProjection().fromLatLngToDivPixel(this.latlng);
                if (this.point) {
                    this.div.style.left = (this.point.x - 10) + 'px';
                    this.div.style.top = (this.point.y - 20) + 'px';
                }
            };

            this.hide = function () {
                this.div.style.display = 'none';
            };
            this.show = function () {
                this.div.style.display = 'block';
            };

            this.hideVehicleNumber = function () {
                this.vehicleNumberWindow.style.display = 'none';
            };
            this.showVehicleNumber = function () {
                this.vehicleNumberWindow.style.display = 'block';
            }
        };

        vm.CustomMarker.prototype = new google.maps.OverlayView();

        vm.CustomMarker.prototype.draw = function() {

            var self = this;
            if (!self.div) {

                // initializing DOM Elemets
                self.div = document.createElement('div');
                self.vehicleNumberWindow = document.createElement('div');

                // Setting propeties
                self.div.className = 'customMarker';
                self.div.style.position = 'absolute';
                self.div.style.cursor = 'pointer';

                self.vehicleNumberWindow.className = 'vehicleNumberWindow';
                innerHtml = '<div>'+self.args.marker.vehicleno+'</div> <div class="vnw-close">x</div>';
                self.vehicleNumberWindow.innerHTML = innerHtml;
                self.vehicleNumberWindow.style.display = 'none';

                self.div.appendChild(self.vehicleNumberWindow);

                //
                // if (typeof(self.args.marker_id) !== 'undefined') {
                //     self.div.dataset.marker_id = self.args.marker_id;
                // }

                google.maps.event.addDomListener(self.div.querySelector('.vnw-close'), "click", function(event) {
                    self.hideVehicleNumber();
                });

                var panes = this.getPanes();
                panes.overlayImage.appendChild(self.div);
            }

            this.point = this.getProjection().fromLatLngToDivPixel(this.latlng);

            if (this.point) {
                self.div.style.left = (this.point.x - 6) + 'px';
                self.div.style.top = (this.point.y - 6) + 'px';
            }
        };

        vm.CustomMarker.prototype.remove = function() {
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        };

        vm.CustomMarker.prototype.getPosition = function() {
            return this.latlng;
        };
    }
})();
