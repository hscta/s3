/**
 * Created by harshas on 14/10/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('InnerMapController', InnerMapController);

    function InnerMapController($rootScope, $scope, $log, $mdToast, historyService, $interval, $filter) {
        $log.log('InnerMapController');
        var vm = this;
        var marker = historyService.historyMapObj.dashboardMapObj.clickedMarker;

        //$log.log(marker);
        var historyMap = historyService.historyMapObj.historyMap;
        var timeIncreaseBy = 240000;
        var initialTime;
        var tracePoint;
        var graphCanvas;
        var context;

        $scope.slider = historyService.playerControls.slider;
        var animationCount = historyService.playerControls.animationCount;

        $scope.setSliderTime = function () {
            if (!(marker && marker.trace.path.length))
                return;

            $scope.initialSliderTime = 0;
            $scope.finalSliderTime = (marker.trace.path[marker.trace.path.length - 1].gpstime -
                marker.trace.path[0].gpstime ) / 1000;
        };

        $scope.setSliderTime();

        var initialPoint = marker.trace.path[animationCount];
        if (initialPoint) {
            $scope.tracePointGpsTime = initialPoint.gpstime;
            $scope.tracePointOdometer = initialPoint.odometer;
            $scope.tracePointSpeed = initialPoint.speed;
            $scope.ignStatus = initialPoint.ignstatus;
        }

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
            $scope.ignStatus = tracePoint.ignstatus;
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
                                //$log.log(animationCount);
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

                }, 200);
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
            //$log.log(marker);

            $scope.tracePointGpsTime = initialPoint.gpstime;
            $scope.tracePointOdometer = initialPoint.odometer;
            $scope.tracePointSpeed = initialPoint.speed;

            marker.latitude = marker.trace.path[0].latitude;
            marker.longitude = marker.trace.path[0].longitude;

            historyService.historyMapObj.latitude = marker.trace.path[marker.trace.path.length-1].latitude;
            historyService.historyMapObj.longitude = marker.trace.path[marker.trace.path.length-1].longitude;
            drawGraph();
        };


        $rootScope.$on('gotHistoryEvent', function (event, data) {
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

        function returnLoopCount(arr, idx) {
            if (arr[idx + 1]) {
                return parseInt((arr[idx + 1].gpstime - arr[idx].gpstime) / 1000 / topDiff);
            }
        }

        var topDiff;

        function drawGraph() {
            var pathArray = marker.trace.path;
            var dummyEl;
            var tempPathArray = [];
            var diff = 0;
            var diffMap = {};

            // creating diff map
            for (var idx = 0; idx < pathArray.length; idx++) {
                if (pathArray[idx + 1]) {
                    diff = (pathArray[idx + 1].gpstime - pathArray[idx].gpstime) / 1000;
                    if (!(diff in diffMap)) {
                        diffMap[diff] = 1;
                    } else {
                        diffMap[diff] = diffMap[diff] + 1;
                    }
                }
            }

            topDiff = 0;
            for (key in diffMap) {
                if (diffMap[key] > topDiff) {
                    topDiff = key;
                }
            }

            // creating new array by adding dummy
            for (var i = 0; i < pathArray.length; i++) {
                returnLoopCount(pathArray, i);
                if (pathArray[i].ignstatus) {
                    tempPathArray.push(pathArray[i]);
                } else {
                    if (i > 0) {
                        dummyEl = angular.copy(!pathArray[i - 1]);
                        for (var j = 0; j < returnLoopCount(pathArray, i); j++) {
                            tempPathArray.push(dummyEl);
                        }
                    } else {
                        tempPathArray.push(!pathArray[0]);
                    }
                }
            }

            pathArray = tempPathArray;

            var length = pathArray.length;
            var width = parseInt($('#historyGraphCanvas').width());
            var ratio = 1 / (width / length );
            var ratio2 = width / length;
            if ((parseInt(ratio) - ratio) > 0.5) {
                ratio = parseInt(ratio) + 1;
            } else {
                ratio = parseInt(ratio);
            }
            if (ratio == 0) {
                ratio = 1;
            }
            var counter = ratio;
            var counter2 = 0;
            graphCanvas.width = width;
            context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

            for (path in pathArray) {
                counter++;
                counter2++;
                if (counter >= ratio) {
                    counter = 0;
                    renderRectangle(counter2, pathArray[path], ratio2);
                }
            }
        }


        function renderRectangle(point, path, ratio) {
            point = parseInt(point * ratio);
            var width = parseInt(ratio) + 1;
            if (path.ignstatus) {
                context.fillStyle = "orange";
                context.fillRect(point, 20, width, 100);
            }
            if (parseInt(path.speed) > 0) {
                context.fillStyle = "green";
                context.fillRect(point, 70, width, 50);
            }
        }


        isRendered('historyGraphCanvas', function (el) {
            graphCanvas = el;
            context = graphCanvas.getContext("2d");
        });


        function isRendered(id, callback) {
            var inter = $interval(function () {
                if (document.getElementById(id)) {
                    $interval.cancel(inter);
                    callback(document.getElementById(id));
                }
            }, 200);
        }


        vm.init = function(){

        };

        vm.init();
    }

})();
