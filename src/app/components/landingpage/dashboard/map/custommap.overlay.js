(function () {
    'use strict';

    angular.module('uiplatform')
        .service('customMapOverlay', customMapOverlay);


    function customMapOverlay($log,$timeout) {
        var vm = this;

        vm.markerHeight = 12;
        vm.markerWidth = 12;

        var innerHtml;

        vm.CustomMarker = function(lat, lng, map, args) {
            var self = this;
            self.latlng = new google.maps.LatLng(lat,lng);
            self.args = args;
            self.map = map;
            self.setMap(map);

            self.dropAnimation = false;


            self.hide = function () {
                if(self.div){
                    self.div.style.display = 'none';
                }
            };
            self.show = function () {
                if(self.div){
                    self.div.style.display = 'block';
                }
            };

            self.hideVehicleNumber = function () {
                self.vehicleNumberWindow.style.display = 'none';
            };
            self.showVehicleNumber = function () {
                self.vehicleNumberWindow.style.display = 'block';
            }
        };

        vm.CustomMarker.prototype = new google.maps.OverlayView();



        vm.CustomMarker.prototype.setPosition = function(obj){
            var self = this;
            self.latlng = new google.maps.LatLng(obj.latitude,obj.longitude);
            if(self.getProjection()){
                self.point = self.getProjection().fromLatLngToDivPixel(self.latlng);
                if (self.point && self.div) {
                    self.div.style.left = (self.point.x - (vm.markerWidth/2)) + 'px';
                    self.div.style.top = (self.point.y - (vm.markerHeight/2)) + 'px';
                }
            }
        };

        vm.CustomMarker.prototype.highlightMe = function() {
            var self = this;
            if(self.notifier){
                if(!self.dropAnimation){
                    self.notifier.className = 'overlayNotifier animate';
                    self.dropAnimation = true;
                }else{
                    self.notifier.className = 'overlayNotifier';
                    self.dropAnimation = false;
                }
            }
        };
        
        vm.CustomMarker.prototype.draw = function() {

            var self = this;
            if (!self.div) {

                // initializing DOM Elemets
                self.div = document.createElement('div');
                self.vehicleNumberWindow = document.createElement('div');
                self.notifier = document.createElement('span');
                // Setting propeties
                self.div.className = 'customMarker';
                self.div.style.position = 'absolute';
                self.div.style.display = 'none';
                self.div.style.cursor = 'pointer';

                self.vehicleNumberWindow.className = 'vehicleNumberWindow';
                innerHtml = '<input type="text" value="'+self.args.marker.vehicleno+'" readonly/> <div class="vnw-close">x</div>';
                self.vehicleNumberWindow.innerHTML = innerHtml;
                self.vehicleNumberWindow.style.display = 'none';


                self.notifier.className = 'overlayNotifier';

                // Appending Elements
                self.div.appendChild(self.vehicleNumberWindow);
                self.div.appendChild(self.notifier);

                //
                // if (typeof(self.args.marker_id) !== 'undefined') {
                //     self.div.dataset.marker_id = self.args.marker_id;
                // }

                google.maps.event.addDomListener(self.div.querySelector('.vnw-close'), "click", function(event) {
                    self.hideVehicleNumber();
                });

                google.maps.event.addDomListener(self.div.querySelector('input'), "click", function(e) {
                    this.select();
                    console.log('clicked!');
                });
                var panes = this.getPanes();
                panes.overlayImage.appendChild(self.div);
            }


            this.point = this.getProjection().fromLatLngToDivPixel(this.latlng);
            if (this.point) {
                self.div.style.left = (this.point.x - (vm.markerWidth/2)) + 'px';
                self.div.style.top = (this.point.y - (vm.markerHeight/2)) + 'px';
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
        // console.log(new vm.CustomMarker());

    }
})();
