/**
 * Created by harshas on 14/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('InnerMapController', InnerMapController);

    function InnerMapController($scope, $log, $mdToast, historyService, $interval, $timeout) {
        $log.log('InnerMapController');
        var vm = this;
        var marker = historyService.historyMapObj.dashboardMapObj.clickedMarker;

        // $log.log(marker);
        var historyMap = historyService.historyMapObj.historyMap;
        var timeIncreaseBy = 120000;
        var initialTime;
        var tracePoint;


        $scope.slider = historyService.playerControls.slider;
        var animationCount = historyService.playerControls.animationCount;

        // $log.log(animationCount, $scope.slider);
        $scope.setSliderTime = function () {
            if (!(marker && marker.trace.path.length))
                return;

            $scope.initialSliderTime = 0;
            $scope.finalSliderTime = (marker.trace.path[marker.trace.path.length - 1].gpstime -
                marker.trace.path[0].gpstime ) / 1000;
            //$log.log($scope.initialSliderTime, $scope.finalSliderTime);
        };


        //if ( $scope.slider > 0 && animationCount > 0 ) {
        $scope.setSliderTime();

        var initialPoint = marker.trace.path[animationCount];
        if (initialPoint) {
            $scope.tracePointGpsTime = initialPoint.gpstime;
            $scope.tracePointOdometer = initialPoint.odometer;
            $scope.tracePointSpeed = initialPoint.speed;
        }
        // }

        // $log.log($scope.slider);
        $scope.play = true;
        $scope.ffrate = historyService.playerControls.ffRate;

        $scope.moveOneStep = function (movementType) {
            if (!marker.trace.path.length)
                return;


            var path = marker.trace.path;

            if (movementType == 'forward') {
                animationCount++;
                if (path.length - 1 < animationCount)
                    animationCount = path.length - 1;

            } else {
                animationCount--;
                if (animationCount <= 0)
                    animationCount = 0;
            }

            $scope.slider = (path[animationCount].gpstime - path[0].gpstime) / 1000
            updateTracePoint(path[animationCount]);

            initialTime = path[animationCount].gpstime;
        };

        $scope.getSliderTime = function () {
            if (marker && marker.trace.path.length) {
                return new Date(marker.trace.path[0].gpstime + Math.floor($scope.slider) * 1000);
            }
        };


        $scope.onChangeSlider = function () {
            if (marker && !marker.trace.path.length)
                return;

            $scope.sliderTime = $scope.getSliderTime();
            // $log.log("jump slider to " + $scope.sliderTime);

            $scope.slider = Math.floor($scope.slider);

            var len = marker.trace.path.length;
            var path = marker.trace.path;
            var initialSliderTime = path[0].gpstime;
            var clickedSliderTimeLimit = initialSliderTime + $scope.slider * 1000;

            for (var idx = 0; idx < len; idx++) {
                if (path[idx].gpstime > clickedSliderTimeLimit)
                    break;
            }

            animationCount = idx - 1;
            initialTime = path[animationCount].gpstime;
            updateTracePoint(path[animationCount]);
        };

        var updateTracePoint = function (tracePoint) {
            marker.latitude = tracePoint.latitude;
            marker.longitude = tracePoint.longitude;

            $scope.tracePointGpsTime = tracePoint.gpstime;
            $scope.tracePointOdometer = tracePoint.odometer;
            $scope.tracePointSpeed = tracePoint.speed;
        };

        $scope.traceRoute = function () {
            //if (marker.trace.path.length && $scope.gotHistory()) {
            if (marker.trace.path.length && $scope.gotHistory()) {
                initialTime = marker.trace.path[animationCount].gpstime;

                $scope.animateMarker = $interval(function () {
                    // $log.log(marker, animationCount);
                    initialTime += (timeIncreaseBy * $scope.ffrate);
                    while (animationCount < marker.trace.path.length) {
                        // $log.log('in loop ' + animationCount);
                        tracePoint = marker.trace.path[animationCount];
                        if (tracePoint.gpstime <= initialTime) {

                            updateTracePoint(tracePoint);

                            $scope.slider = (tracePoint.gpstime - marker.trace.path[0].gpstime) / 1000;
                            $scope.sliderTime = $scope.getSliderTime();

                            if (animationCount % 10 === 0) {
                                moveMapWithMarker(marker);
                            }
                            animationCount++;
                        } else {
                            break;
                        }
                    }

                    if (animationCount >= marker.trace.path.length || !$scope.gotHistory()) {
                        $scope.stopAnimation();
                        moveMapWithMarker(marker);
                    }

                }, 100);
            }
        };


        $scope.fastForward = function () {
            if ($scope.ffrate < 128) {
                $scope.ffrate *= 2;
            }
        };


        $scope.goSlow = function () {
            if ($scope.ffrate > (1 / 128)) {
                $scope.ffrate /= 2;
            }
        };


        $scope.getAnimationRate = function () {
            var animationRate = Math.floor((timeIncreaseBy / 1000) * $scope.ffrate);
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Playing ' + animationRate + ' secs in 1 sec')
                    .position(100, 100)
                    .hideDelay(3000)
            );
        };


        $scope.stopAnimation = function () {
            // animationCount = 0;
            stopPlay();
            //$scope.slider = 0;
            if (marker && marker.trace.path.length > 0 && animationCount) {
                animationCount = 0;
                $scope.slider = 0;
                marker.latitude = marker.trace.path[animationCount].latitude;
                marker.longitude = marker.trace.path[animationCount].longitude;
            }
        };

        var stopPlay = function () {
            $interval.cancel($scope.animateMarker);
            $scope.play = true;
        };

        $scope.$on('$destroy', function () {
            historyService.playerControls.slider = $scope.slider;
            historyService.playerControls.animationCount = animationCount;
            historyService.playerControls.ffRate = $scope.ffrate;
            //  historyService.setData('getHistory', false);
            $scope.stopAnimation();
        });


        $scope.playAnimation = function () {
            //$log.log('playAnimation');
            $scope.play = false;
            $scope.traceRoute();
        };


        $scope.pauseAnimation = function () {
            //$log.log('pauseAnimation');
            $scope.play = true;
            $scope.pauseInterval();
        };

        $scope.pauseInterval = function () {
            $interval.cancel($scope.animateMarker);
            $scope.animateMarker = undefined;
        };

        $scope.gotHistory = function () {
            return historyService.getData('getHistory');
        };

        $scope.gotHistoryEvent = function () {
            animationCount = 0;
            $scope.slider = 0;
            $scope.ffrate = 1;
            historyService.resetPlayerControls();

            $scope.setSliderTime();
            var initialPoint = marker.trace.path[0];
            $scope.tracePointGpsTime = initialPoint.gpstime;
            $scope.tracePointOdometer = initialPoint.odometer;
            $scope.tracePointSpeed = initialPoint.speed;
        };

        $scope.$on('gotHistoryEvent', function (event, data) {
            $scope.gotHistoryEvent();
        });


        var moveMapWithMarker = function (marker) {
            var map = historyMap.mapControl.getGMap();
            var projection = map.getProjection();

            var centerPoint = projection.fromLatLngToPoint(map.getCenter());
            var scale = Math.pow(2, map.getZoom());

            var worldPoint = projection.fromLatLngToPoint(new google.maps.LatLng({
                lat: marker.latitude,
                lng: marker.longitude
            }));
            var xdiff = Math.abs((worldPoint.x - centerPoint.x) * scale);

            var ydiff = Math.abs((worldPoint.y - centerPoint.y) * scale);
            var panX = Math.floor((worldPoint.x - centerPoint.x) * scale);

            var panY = Math.floor((worldPoint.y - centerPoint.y) * scale);
            if (xdiff > 500 || ydiff > 200) {
                map.panBy(panX, panY);
            }
        };


        $scope.sampleData = {
            1:{ignition:true},
            2:{ignition:true},
            3:{ignition:true},
            4:{ignition:true},
            5:{ignition:true},
            6:{ignition:true},
            7:{ignition:true},

            8:{ignition:false},
            9:{ignition:false},
            10:{ignition:false},

            11:{ignition:true},

            12:{ignition:false},
            13:{ignition:false},
            14:{ignition:false},

            15:{ignition:true},
            16:{ignition:true},
            17:{ignition:true},
            18:{ignition:true},
            19:{ignition:true},

            20:{ignition:false},
            21:{ignition:false},
            22:{ignition:false},
            23:{ignition:false},
            24:{ignition:false},
            25:{ignition:false},
            26:{ignition:false},

            27:{ignition:true},
            28:{ignition:true},
            29:{ignition:true},
            30:{ignition:true},
        };

        $scope.graphWRatio = 100 / Object.keys($scope.sampleData).length;
        var graphCanvas;
        isRendered('#historyGraphCanvas', function (el) {
            graphCanvas = el;
        });

        function isRendered(id,callback) {
            var inter = $interval(function () {
                if(document.querySelector(id)){
                    $interval.cancel(inter);
                    callback(document.querySelector(id));
                }
            },200);

        }

    }

})();
