/**
 * Created by Rinas Musthafa on 11/27/2016.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('History2Controller', History2Controller)

    function History2Controller($scope, $log, $mdDialog, dialogService,
                               $interval, intellicarAPI, history2Service,
                               geofenceViewService, $state, $timeout) {

        var vm = this;

        function loadMap() {
            vm.historyMap = history2Service.historyMap;
            vm.historyMap.map = new google.maps.Map(document.getElementById("history_map"), vm.historyMap.mapOptions);
            vm.historyMap.map.addListener('click', function() {

            });
            setMapHeight();
            $interval(vm.resizeMap, 1000);
        }

        vm.getHistory = function () {
            history2Service.setData('getHistory', false);
            history2Service.getHistoryData();
        }

        function setMapHeight() {
            wh = $(window).height();
            header_height = 100;
            isRendered('#history_map', function (el) {
                el.css('height', (wh - header_height) + 'px');
            });
        }

        $(window).resize(function () {
            setMapHeight();
        });

        function isRendered(el, callback) {
            var isr_interval = setInterval(function () {
                if ($(el).length > 0) {
                    callback($(el));
                    clearInterval(isr_interval);
                }
            }, 200)
        }


        vm.init = function () {
            loadMap();
            setDefaultVehicle();
        };

        function setDefaultVehicle() {
            var startInterval = $interval(function () {
                var keys = Object.keys(vm.historyMap.markersByPath);
                if(keys.length > 0){
                    vm.historyMap.selectedVehicle = vm.historyMap.vehiclesByPath[keys[0]];
                    $interval.cancel(startInterval);
                }
            }, 500 )
        }

        vm.resizeMap = function () {
            google.maps.event.trigger(vm.historyMap.map , 'resize');
            return true;
        };



        vm.init();
    }

})();
