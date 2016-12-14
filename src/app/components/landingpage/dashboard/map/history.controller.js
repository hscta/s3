/**
 * Created by Rinas Musthafa on 11/27/2016.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('HistoryController', HistoryController)
        .controller('HistoryTableController', HistoryTableController);


    function HistoryController($scope, $window, $interval, historyService, $stateParams, $log, vehicleService, mapService, $timeout,
                               dialogService, geofenceViewService, $compile) {

        var vm = this;

        $scope.getMatches = function (str) {
            var matchArray = [];
            if (str == null) str = '';
            var modelString;
            str = str.toLowerCase();
            for (var idx in vm.historyMap.markersByPath) {
                modelString = vehicleService.vehiclesByPath[idx].rtgps.vehicleno;
                modelString = modelString.toLowerCase();
                if (modelString.indexOf(str) != -1) {
                    matchArray.push(vehicleService.vehiclesByPath[idx]);
                }
            }
            return matchArray;
        }

        dialogService.setTab(0);

        var historyFenceInfowindow = new google.maps.InfoWindow();


        function loadMap() {
            vm.historyMap = historyService.historyMap;
            vm.historyMap.map = new google.maps.Map(document.getElementById("history_map"),
                vm.historyMap.mapOptions);
            vm.historyMap.map.addListener('click', function () {

            });
            setMapHeight();
            $interval(vm.resizeMap, 1000);
        }

        vm.getHistory = function () {
            historyService.setData('getHistory', false);
            historyService.getHistoryData();
        };

        function setMapHeight() {
            if (vm.gotHistory) {
                header_height = 160;
            } else {
                header_height = 50;
            }
            isRendered('.mapDView', function (el1) {
                var wh = el1.height();
                isRendered('#history_map', function (el) {
                    el.css('height', (wh - header_height) + 'px');
                });
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


        function setDefaultVehicle() {
            //$log.log(vm.historyMap.selectedVehicle);
            if (vm.historyMap.selectedVehicle == null) {
                // var startInterval = $interval(function () {
                var keys = Object.keys(vehicleService.vehiclesByPath);
                if (keys.length > 0) {
                    // $log.log(vehicleService.vehiclesByPath[keys[0]]);
                    vm.historyMap.selectedVehicle = vehicleService.vehiclesByPath[keys[0]];
                    // $interval.cancel(startInterval);
                }
                // }, 500 )
            }
        }


        vm.resizeMap = function () {
            google.maps.event.trigger(vm.historyMap.map, 'resize');
            return true;
        };


        vm.traceControls = historyService.traceControls;

        vm.traceControls.jumpToTime = function (time) {
            if (vm.traceControls.current + time < 0) {
                vm.traceControls.current = 0;
                vm.traceControls.moveTimeline();
            } else if (vm.traceControls.current + time > vm.traceControls.timeline.length) {
                vm.traceControls.current = vm.traceControls.timeline.length - 1;
                vm.traceControls.moveTimeline();
            } else {
                vm.traceControls.current += time;
                vm.traceControls.moveTimeline();
            }
        };

        vm.traceControls.setPointerTransition = function (bool) {
            if (bool) {
                vm.traceControls.pointer.css('transition', vm.traceControls.SPEEDS[vm.traceControls.speed] + 'ms linear');
            } else {
                vm.traceControls.pointer.css('transition', 0 + 'ms linear');
            }
        };

        vm.traceControls.isPointer = function () {
            if (!vm.traceControls.pointer) {
                vm.traceControls.pointer = $('.tc_pointer');
            }
            vm.traceControls.setPointerTransition(true);
        };

        vm.traceControls.stopMotion = function () {
            if (vm.traceControls.playing) {
                vm.traceControls.playing = false;
                $interval.cancel(vm.traceControls.engine);
            }
        };

        vm.traceControls.startMotion = function () {
            if (vm.traceControls.timeline.length > 0 && vm.traceControls.current < vm.traceControls.timeline.length) {
                vm.traceControls.panel.clicked = false;
                vm.traceControls.playing = true;
                if (vm.traceControls.engine) {
                    $interval.cancel(vm.traceControls.engine);
                }
                vm.traceControls.current++;
                vm.traceControls.moveTimeline();
                vm.traceControls.engine = $interval(function () {
                    if (vm.traceControls.current >= vm.traceControls.timeline.length) {
                        $interval.cancel(vm.traceControls.engine);
                        vm.traceControls.playing = false;
                    } else {
                        vm.traceControls.current++;
                    }
                    vm.traceControls.moveTimeline();
                }, vm.traceControls.SPEEDS[vm.traceControls.speed]);
            }
        };

        vm.traceControls.moveTimeline = function () {
            if (vm.historyMap.startMarker && vm.traceControls.current < vm.traceControls.timeline.length) {
                var left = vm.traceControls.current / vm.traceControls.timeline.length * 100;
                vm.traceControls.pointer.css({'left': left + '%'});
                vm.historyMap.startMarker.setPosition(vm.traceControls.timeline[vm.traceControls.current]);
                moveMapWithMarker(vm.historyMap.startMarker);
                vm.traceControls.updateAllTimelines(vm.traceControls.timeline[vm.traceControls.current].gpstime);
            }
        };

        vm.traceControls.updateAllTimelines = function (timestamp) {
            selectTimelineData(timestamp);
            for (var idx in vm.tcGraphs.charts) {
                vm.tcGraphs.charts[idx].object.updateLine(timestamp, vm.tcGraphs.charts[idx]);
            }
        };


        var moveMapWithMarker = function (marker) {
            if (marker == null)
                return;
            var map = vm.historyMap.map;
            var projection = map.getProjection();

            var centerPoint = projection.fromLatLngToPoint(map.getCenter());
            var scale = Math.pow(2, map.getZoom());

            var worldPoint = projection.fromLatLngToPoint(marker.getPosition());

            var xdiff = Math.abs((worldPoint.x - centerPoint.x) * scale);

            var ydiff = Math.abs((worldPoint.y - centerPoint.y) * scale);
            var panX = Math.floor((worldPoint.x - centerPoint.x) * scale);

            var panY = Math.floor((worldPoint.y - centerPoint.y) * scale);
            if (xdiff > 500 || ydiff > 200) {
                map.panBy(panX, panY);
            }
        };


        vm.traceControls.mouseMoveEvent = function (event) {
            var start = vm.traceControls.timeline.length;
            var width = vm.traceControls.panel.element.width();
            var position = vm.traceControls.panel.element.offset().left;
            if (position < 0)
                position = 0;
            vm.traceControls.current = parseInt((event.pageX - position) * start / width) + 1;
            if (vm.traceControls.current >= vm.traceControls.timeline.length)
                vm.traceControls.current = vm.traceControls.timeline.length - 1;
            vm.traceControls.moveTimeline();
        };

        vm.traceControls.speedThreshold = 3;
        vm.traceControls.graphBase = 0;
        vm.traceControls.barHeight = 7;
        vm.traceControls.barMargin = 1;
        vm.traceControls.barBase = 0;
        vm.traceControls.myCanvas = null;
        vm.traceControls.ctx;
        vm.traceControls.cw;
        vm.traceControls.ch;
        vm.traceControls.wr;

        function drawTimeline() {
            // creating canvas
            if (vm.traceControls.myCanvas != null) {
                vm.traceControls.myCanvas.remove();
            }
            vm.traceControls.myCanvas = document.createElement('canvas');
            vm.traceControls.ctx = vm.traceControls.myCanvas.getContext("2d");
            vm.traceControls.cw = vm.traceControls.panel.element.width();
            vm.traceControls.ch = vm.traceControls.panel.element.height();
            vm.traceControls.wr = vm.traceControls.panel.element.width() / vm.traceControls.timeline.length;
            vm.traceControls.myCanvas.height = vm.traceControls.ch;
            vm.traceControls.myCanvas.width = vm.traceControls.cw;
            vm.traceControls.panel.element.append(vm.traceControls.myCanvas);

            vm.traceControls.ctx.fillStyle = '#f00';
            vm.traceControls.ctx.fillRect(0, 0, vm.traceControls.timeline.length * vm.traceControls.wr, vm.traceControls.ch);
            vm.traceControls.ctx.fill();
            // drawing things
            vm.traceControls.ctx.clearRect(0, 0, vm.traceControls.timeline.length * vm.traceControls.wr, vm.traceControls.ch);
            var pre_ignstatus = false;
            var pre_moving = false;
            var ign_rect = {};
            var moving_rect = {};
            var graphLineLimit = parseInt(vm.traceControls.timeline.length / 1000);
            graphLineLimit *= 10;
            if (graphLineLimit < 10)
                graphLineLimit = 10;
            var highestSpeed = 0;

            vm.traceControls.ctx.strokeStyle = 'rgba(0,0,0, 0.04)';
            for (var idx in vm.traceControls.timeline) {
                if (idx % graphLineLimit == 0) {
                    vm.traceControls.ctx.moveTo(idx * vm.traceControls.wr, 0);
                    vm.traceControls.ctx.lineTo(idx * vm.traceControls.wr, vm.traceControls.ch);
                }
            }
            vm.traceControls.ctx.stroke();
            vm.traceControls.ctx.strokeStyle = 'rgba(0,0,0, 0.1)';
            for (var idx = 1; idx < 4; idx++) {
                vm.traceControls.ctx.moveTo(0, idx * vm.traceControls.ch / 4);
                vm.traceControls.ctx.lineTo(vm.traceControls.cw, idx * vm.traceControls.ch / 4);
            }
            vm.traceControls.ctx.stroke();
            for (var idx in vm.traceControls.timeline) {
                var speed = vm.traceControls.timeline[idx].speed;
                if (highestSpeed < speed)
                    highestSpeed = speed;
                var ignition = vm.traceControls.timeline[idx].ignstatus;
                var moving = false;
                if (vm.traceControls.timeline[idx].speed > vm.traceControls.speedThreshold) {
                    moving = true;
                }
                if (ignition && !pre_ignstatus) {
                    ign_rect.x = idx;
                } else if (pre_ignstatus) {
                    ign_rect.w = idx - ign_rect.x;
                    vm.traceControls.ctx.fillStyle = '#9DAAFF';
                    vm.traceControls.ctx.fillRect(ign_rect.x * vm.traceControls.wr, vm.traceControls.barBase, ign_rect.w * vm.traceControls.wr, vm.traceControls.barHeight);
                    vm.traceControls.ctx.fill();
                }
                if (moving && !pre_moving) {
                    moving_rect.x = idx;
                } else if (pre_moving) {
                    moving_rect.w = idx - moving_rect.x;
                    vm.traceControls.ctx.fillStyle = '#63DB5D';
                    vm.traceControls.ctx.fillRect(moving_rect.x * vm.traceControls.wr, vm.traceControls.barBase + ((vm.traceControls.barHeight + vm.traceControls.barMargin) ), moving_rect.w * vm.traceControls.wr, vm.traceControls.barHeight);
                    vm.traceControls.ctx.fill();
                }
                pre_ignstatus = ignition;
                pre_moving = moving;
                vm.traceControls.ctx.fill();
            }
            if (highestSpeed < 60) {
                highestSpeed = 60;
            }
            highestSpeed += 20 + vm.traceControls.graphBase;
            vm.traceControls.ctx.beginPath();
            vm.traceControls.ctx.moveTo(0, vm.traceControls.ch - vm.traceControls.graphBase);
            vm.traceControls.ctx.strokeStyle = '#e74c3c';
            vm.traceControls.ctx.fillStyle = 'rgba(255, 69, 0, 0.2)';
            for (var idx in vm.traceControls.timeline) {
                if (vm.traceControls.timeline[idx].speed < vm.traceControls.speedThreshold)
                    vm.traceControls.timeline[idx].speed = 0;
                var speed = vm.traceControls.timeline[idx].speed / highestSpeed * vm.traceControls.ch;
                vm.traceControls.ctx.lineTo(idx * vm.traceControls.wr, vm.traceControls.ch - speed - vm.traceControls.graphBase);
            }
            ;
            vm.traceControls.ctx.lineTo(vm.traceControls.timeline.length * vm.traceControls.wr, vm.traceControls.ch - vm.traceControls.graphBase);
            vm.traceControls.ctx.lineTo(0, vm.traceControls.ch - vm.traceControls.graphBase);
            vm.traceControls.ctx.closePath();
            vm.traceControls.ctx.stroke();
            vm.traceControls.ctx.fill();
        }

        function generateTimeline(path) {
            if (path.length < 1) {
                vm.traceControls.timeline = [];
                return;
            }
            // setting and resetting track history  variables
            vm.traceControls.selectedVehicle = vm.historyMap.selectedVehicle;
            vm.traceControls.panel.clicked = true;

            var timeline = [];
            var first = angular.copy(path[0]);
            var last = angular.copy(path[path.length - 1]);
            var currentTime = first.gpstime;
            var currentPathIdx = 0;

            while (1) {
                if (currentPathIdx >= path.length) {
                    break;
                }

                if (currentTime >= path[currentPathIdx].gpstime) { // regular points
                    timeline.push(path[currentPathIdx]);
                    currentTime = path[currentPathIdx].gpstime + vm.traceControls.interval;
                    currentPathIdx++;
                } else { // dummy points
                    var dummy = getDefaultGraphObject(path[currentPathIdx]);
                    dummy.gpstime = currentTime;
                    timeline.push(dummy);
                    currentTime += vm.traceControls.interval;
                }

                if (timeline.length > 2 && timeline[timeline.length - 1].gpstime - timeline[timeline.length - 2].gpstime > 30000) {
                    console.log(new Date(timeline[timeline.length - 2].gpstime), new Date(timeline[timeline.length - 1].gpstime))
                }
            }
            vm.traceControls.timeline = timeline;
        }

        function getDefaultGraphObject(point) {
            var latlng = angular.copy(point);
            // latlng.id = vm.historyMap.deviceid;
            // latlng.deviceid = vm.historyMap.deviceid;
            latlng.gpstime = 0;
            latlng.speed = 0
            latlng.odometer = 0
            latlng.heading = 0
            latlng.ignstatus = 0
            return latlng;
        }

        function getTimelineObjects() {
            vm.traceControls.pointer = $('.tc_pointer');
            vm.traceControls.panel = {
                clicked: true,
            };
            vm.traceControls.panel.element = $('.tc_panel');
            vm.traceControls.panel.element.mousedown(function (event) {
                if (!vm.traceControls.playing) {
                    if (!vm.traceControls.panel.clicked) {
                        vm.traceControls.panel.clicked = true;
                    } else {
                        vm.traceControls.panel.clicked = false;
                    }
                }

                vm.traceControls.pointer.css('transition', 0 + 'ms linear');
                vm.traceControls.mouseMoveEvent(event);
            });
            $($window).mouseup(function () {
                // vm.traceControls.panel.clicked = false;
                // vm.traceControls.pointer.css('transition', vm.traceControls.SPEEDS[vm.traceControls.speed] + 'ms linear');
            });
            vm.traceControls.panel.element.mousemove(function (event) {
                if (vm.traceControls.panel.clicked) {
                    vm.traceControls.setPointerTransition(false);
                    vm.traceControls.mouseMoveEvent(event);
                }
            });

            $($window).keyup(function () {
                vm.traceControls.setPointerTransition(true);
            });
            $($window).keydown(function (event) {
                vm.traceControls.setPointerTransition(false);
                if (event.keyCode == 32 || event.keyCode == 31) {
                    event.preventDefault();
                    vm.traceControls.togglePlay();
                }
                // if(!vm.traceControls.playing ){
                if (event.keyCode == 37) { // left
                    vm.traceControls.jumpToTime(-1);
                } else if (event.keyCode == 38) { // up
                    vm.traceControls.jumpToTime(10);
                } else if (event.keyCode == 39) { // right
                    vm.traceControls.jumpToTime(1);
                } else if (event.keyCode == 40) { // down
                    vm.traceControls.jumpToTime(-10);
                }
                // }
            });
        }

        vm.gotHistoryEvent = function (event, data) {
            vm.gotHistory = historyService.getData('getHistory');
            setMapHeight();
            generateTimeline(data.path);
            generateExpandedGraph(data.path);
            drawTimeline();
        };

        vm.gotHistoryEventFailed = function () {
            vm.gotHistory = historyService.getData('getHistory');
            setMapHeight();
        };

        vm.getCurrentPos = function () {
            return vm.traceControls.timeline[vm.traceControls.current];
        };


        vm.historyFenceWindowLoad = function () {
            $scope.$apply(function () {
                $compile(document.getElementById("historyFenceWindow"))($scope);
            });
        };

        vm.getMyFencesListener = function (fences) {
            //$log.log(fences);
            if (fences.polygons)
                vm.createPolygons(fences.polygons);

            if (fences.circles)
                vm.createCircles(fences.circles);
        };


        vm.createPolygons = function (polygons) {
            var polygonMap = {};
            for (var idx in polygons) {
                google.maps.event.addListener(polygons[idx].googleObject, 'click', function (evt) {
                    vm.selectedFenceObj = this;
                    historyFenceInfowindow.setContent(document.getElementById("history_fence_infowindow").innerHTML);
                    historyFenceInfowindow.setPosition(evt.latLng);
                    historyFenceInfowindow.open(vm.historyMap.map, this);
                });

                // if (checkFilterString( polygons[idx].control.info.tagdata)){
                //  polygons[idx].googleObject.setMap( vm.historyMap.map);
                // }
            }
        };

        vm.createCircles = function (circles) {
            for (var idx in circles) {
                google.maps.event.addListener(circles[idx].googleObject, 'click', function (evt) {
                    vm.selectedFenceObj = this;
                    historyFenceInfowindow.setPosition(evt.latLng);
                    historyFenceInfowindow.setContent(document.getElementById("history_fence_infowindow").innerHTML);
                    historyFenceInfowindow.open(vm.historyMap.map, this);
                });
                circles[idx].googleObject.setMap(vm.historyMap.map);
            }
        };


        vm.toggleExpandedGraphs = function (id) {
            if (id == 'toggle') {
                if (vm.traceControls.expandedGraphs == 'full') {
                    vm.traceControls.expandedGraphs = 'half';
                } else {
                    vm.traceControls.expandedGraphs = 'full';
                }
            } else if (id == 'close') {
                if (vm.traceControls.expandedGraphs == false) {
                    vm.traceControls.expandedGraphs = 'half';
                } else {
                    vm.traceControls.expandedGraphs = false;
                }
            }
            $timeout(function () {
                moveMapWithMarker(vm.historyMap.startMarker);
            }, 1000);
        };

        function createExpandedGraph() {
            var tempInter = $interval(function () {
                if ($('.tcg_item')) {
                    vm.traceControls.expDiv = $('.tcg_item');
                    $interval.cancel(tempInter);
                    for (var idx in vm.tcGraphs.charts) {
                        vm.tcGraphs.charts[idx].data.height = vm.traceControls.expDiv.height() - 30;
                        vm.tcGraphs.charts[idx].data.width = vm.traceControls.expDiv.width();
                        if (!vm.tcGraphs.charts[idx].data.margin)
                            vm.tcGraphs.charts[idx].data.margin = vm.tcGraphs.margin;
                        vm.tcGraphs.charts[idx].object = new d3Graph(vm.tcGraphs.charts[idx]);
                    }
                    $(window).resize(function () {
                        resizeTcGraphs();
                    });
                }
            }, 200);
        }

        function resizeTcGraphs() {
            drawTimeline();
        }

        function generateExpandedGraph() {
            for (var idx in vm.tcGraphs.charts) {
                parseToGraphData(vm.tcGraphs.charts[idx], vm.traceControls.timeline);
                vm.tcGraphs.charts[idx].object.draw(vm.tcGraphs.charts[idx].graphs);
            }
        }

        function parseToGraphData(object, data) {
            var graphs = object.graphs;
            // var genGraphs = [];
            for (var jdx in graphs) {
                graphs[jdx].values = [];
                for (var idx in data) {
                    graphs[jdx].values.push({
                        x: data[idx].gpstime,
                        y: data[idx][graphs[jdx].item]
                    })
                }
                // genGraphs.push(graphs[jdx]);
            }
        }

        function selectTimelineData(timestamp) {
            vm.traceControls.current = binSearch(vm.traceControls.timeline, timestamp, 'gpstime');
        };


        function binSearch(array, element, key) {
            var start = 0;
            var end = array.length - 1;
            var mid = start + parseInt((end - start) / 2);

            var binLooping = true;
            var stacksize = 0;
            while (binLooping) {
                stacksize++;
                if (array[mid][key] < element) { // Creater
                    if (mid < array.length - 1)
                        start = mid + 1;
                } else if (array[mid][key] > element) {
                    if (mid > 0)
                        end = mid - 1;
                } else if (Math.abs(array[mid][key] - element) <= 30000) {
                    binLooping = false;
                    break;
                }
                mid = start + parseInt((end - start ) / 2)
                if (stacksize > 1000) break;
            }
            return mid;
        }


        vm.tcGraphs = {
            margin: {left: 50, right: 50, top: 20, bottom: 20},
            charts: [
                {
                    data: {svg: '#visualisation1'},
                    graphs: [{color: '#e74c3c', key: 'Speed', type: 'line', item: 'speed', unit: 'kmph', yAxis: 1}],
                },
                {
                    data: {svg: '#visualisation2'},
                    graphs: [{
                        color: '#3498db',
                        key: 'Vehicle battery',
                        type: 'line',
                        item: 'carbattery',
                        unit: 'v',
                        yAxis: 1
                    },
                        {
                            color: '#e74c3c',
                            key: 'Device battery',
                            type: 'line',
                            item: 'devbattery',
                            unit: 'v',
                            yAxis: 2
                        }],
                }, {
                    data: {svg: '#visualisation3'},
                    graphs: [{color: '#2ecc71', key: 'GPS Signal', type: 'line', item: 'numsat', unit: '', yAxis: 1}],
                }
            ]
        };

        // var d3g1 = new d3Graph(data);

        function d3Graph(param) {
            var self = this;
            self.data = param.data;
            self.chart = param;
            self.vis = d3.select(self.data.svg)
            //responsive SVG needs these 2 attributes and no width and height attr
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + self.data.width + " " + (self.data.height - 30))
                //class to make it responsive
                .classed("svg-content-responsive", true)
                .on("mousemove", mouseHoverEvent);
            //     .on("click", graphDrag)
            //
            // function graphDrag() {
            //     self.mouseX = d3.mouse(this)[0];
            //     var timestamp = parseInt(self.xScale.invert(self.mouseX));
            //     // console.log(self.mouseX);
            //     self.xScale = d3.scale.linear().domain([new Date(timestamp), new Date(self.axisScale.xh)]);
            //     self.draw();
            // }

            function mouseHoverEvent() {
                // var posSvg = Math.ceil($('#visualisation').offset().left);
                // console.log(self.xScale.invert(d3.mouse(this)[0]) - self.xScale.invert(d3.event.pageX - posSvg));
                self.mouseX = d3.mouse(this)[0];
                self.mouseY = d3.mouse(this)[1];
                if (self.xScale != null && self.mouseX >= self.data.margin.left && self.mouseX <= (self.data.width - self.data.margin.right)
                    && self.mouseY >= self.data.margin.top && self.mouseY <= (self.data.height - self.data.margin.bottom)) {

                    var timestamp = parseInt(self.xScale.invert(self.mouseX));
                    vm.traceControls.updateAllTimelines(timestamp);
                    vm.traceControls.moveTimeline();

                }
            }

            self.updateLine = function (x, chart) {
                if(!('xScale' in self)) {
                    console.log("xScale not present");
                }

                var timelineObject = vm.traceControls.timeline[vm.traceControls.current];
                self.mouseX = self.xScale(x);
                self.focusLine
                    .attr('x1', self.mouseX)
                    .attr('x2', self.mouseX);

                for (var idx in chart.graphs) {
                    var key = chart.graphs[idx].item;
                    if (chart.graphs[idx].yAxis == 1) {
                        self.graphY = self.y1Scale(timelineObject[key]);
                    } else {
                        self.graphY = self.y2Scale(timelineObject[key]);
                    }
                    self.focusCircle[idx]
                        .attr("cx", self.mouseX)
                        .attr("cy", self.graphY);
                    var focusRecMargin = 0;
                    var focusStr = timelineObject[key] + ' ' + chart.graphs[idx].unit;
                    var rectWidth = ( focusStr.length * 7) + 5;

                    if (self.mouseX + rectWidth + 10 > self.data.width - self.data.margin.right) {
                        focusRecMargin = rectWidth + 15;
                    }

                    self.focusText[idx].attr("transform", "translate(" + (self.mouseX - focusRecMargin + 8) + "," + 30 + ")")
                        .select("text").text(focusStr);
                    self.focusText[idx]
                        .select("rect")
                        .attr("width", rectWidth)
                }


            };

            self.resize = function (data) {
                self.data.height = data.height;
                self.data.width = data.width;
                self.draw();
            };

            self.draw = function (graphs) {
                if (graphs) self.data.graph = graphs;

                d3.selectAll(self.data.svg + " > *").remove();
                getAxisScale();

                self.xAxis = d3.svg.axis()
                    .scale(self.xScale)
                    .ticks(12)
                    .tickFormat(function (d) {
                        return d3.time.format('%H:%M')(new Date(d))
                    });

                self.y1Axis = d3.svg.axis()
                    .scale(self.y1Scale)
                    .ticks(6)
                    .orient("left");

                self.y2Axis = d3.svg.axis()
                    .scale(self.y2Scale)
                    .ticks(6)
                    .orient("right");

                self.vis.append("svg:g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + (self.data.height - self.data.margin.bottom) + ")")
                    .call(self.xAxis)
                // .selectAll("text")
                // .style("text-anchor", "end")
                // .attr("dx", "-.8em")
                // .attr("dy", ".15em")
                // .attr("transform", function(d) {
                //     return "rotate(-30)"
                // });

                self.vis.append("svg:g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + (self.data.margin.left) + ",0)")
                    .call(self.y1Axis);

                self.vis.append("svg:g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + self.xScale(self.axisScale.xh) + ",0)")
                    .call(self.y2Axis);

                self.lineGenY1 = d3.svg.line().x(function (d) {
                    return self.xScale(d.x);
                }).y(function (d) {
                    return self.y1Scale(d.y);
                });
                self.lineGenY2 = d3.svg.line().x(function (d) {
                    return self.xScale(d.x);
                }).y(function (d) {
                    return self.y2Scale(d.y);
                });
                for (var idx in self.data.graph) {
                    self.vis.append('svg:path')
                        .attr('d', getYlineGen(self.data.graph[idx].yAxis, self.data.graph[idx].values))
                        .attr('stroke', self.data.graph[idx].color)
                        .attr('stroke-width', self.data.graph[idx].strokeWidth)
                        .attr('fill', 'none');
                }
                self.vis.selectAll("circle").on("mouseover", function () {
                    d3.select(this).attr('r', 25)
                });
                self.vis.selectAll("circle").on("mouseout", function () {
                    d3.select(this).attr('r', 6)
                });
                self.focusCircle = [];
                self.focusText = [];
                self.nameText = [];
                for (var idx in self.chart.graphs) {
                    self.focusCircle[idx] = self.vis.append("circle")
                        .attr('class', 'click-circle')
                        .attr("cx", -1000)
                        .attr("cy", -1000)
                        .attr("fill", self.chart.graphs[idx].color)
                        .attr("r", 5);

                    self.nameText[idx] = self.vis.append("text")
                        .attr("x", self.data.margin.left + 10)
                        .attr('fill', self.chart.graphs[idx].color)
                        .attr('class', 'nameText')
                        .attr("y", self.data.margin.top + 10 + (idx * 15))
                        .text(self.chart.graphs[idx].key);


                    self.focusText[idx] = self.vis.append("g")
                    self.focusText[idx].append("rect")
                        .attr("width", 10)
                        .attr("height", 16)
                        .attr('class', 'focusRect')
                        .attr("y", -8 + (idx * 20));

                    self.focusText[idx].append("text")
                        .attr("x", 4)
                        .attr('fill', self.chart.graphs[idx].color)
                        .attr('class', 'focusText')
                        .attr("y", 4 + (idx * 20));
                }
                self.focusLine = self.vis.append("line")
                    .attr('class', 'focus-line')
                    .attr("x1", -1000)
                    .attr("x2", -1000)
                    .attr("y1", self.data.margin.top)
                    .attr("y2", (self.data.height - self.data.margin.top))
                    .attr("stroke-width", 1)
                    .attr("stroke", "#ccc");

                self.updateLine(vm.traceControls.timeline[vm.traceControls.current].gpstime, self.chart)
            };


            function getYlineGen(y, val) {
                if (y == 1) {
                    return self.lineGenY1(val);
                } else if (y == 2) {
                    return self.lineGenY2(val);
                }
            }

            function getAxisScale() {
                self.axisScale = {y1: {}, y2: {}}
                for (var idx in self.data.graph) {
                    var dataItem = self.data.graph[idx];
                    if (dataItem.yAxis == null) {
                        dataItem.yAxis = 1;
                    }

                    for (var jdx in dataItem.values) {
                        if (dataItem.values[jdx].x < self.axisScale.xl || self.axisScale.xl == null) self.axisScale.xl = dataItem.values[jdx].x;
                        if (dataItem.values[jdx].x > self.axisScale.xh || self.axisScale.xh == null) self.axisScale.xh = dataItem.values[jdx].x;

                        if (dataItem.values[jdx].y < self.axisScale['y' + dataItem.yAxis].yl || self.axisScale['y' + dataItem.yAxis].yl == null) self.axisScale['y' + dataItem.yAxis].yl = dataItem.values[jdx].y;
                        if (dataItem.values[jdx].y > self.axisScale['y' + dataItem.yAxis].yh || self.axisScale['y' + dataItem.yAxis].yh == null) self.axisScale['y' + dataItem.yAxis].yh = dataItem.values[jdx].y;
                    }
                }

                self.axisScale.xh += 0;
                self.axisScale.y1.yh = parseInt(self.axisScale.y1.yh + self.axisScale.y1.yh * 0.6);
                self.axisScale.y2.yh = parseInt(self.axisScale.y2.yh + self.axisScale.y1.yh * 0.6);
                // if(self.axisScale.xl > 0 && self.axisScale.xl < 20){self.axisScale.xh = 0; }
                // if(self.axisScale.y1.yl > 0 && self.axisScale.y1.yl < 20 ){self.axisScale.y1.yl = 0; }
                // if(self.axisScale.y2.yl > 0 && self.axisScale.y2.yl < 20 ){self.axisScale.y2.yl = 0; }
                self.axisScale.y1.yl = 0;
                self.axisScale.y2.yl = 0;


                self.xScale = d3.scale.linear().range([self.data.margin.left, self.data.width - self.data.margin.right]).domain([new Date(self.axisScale.xl), new Date(self.axisScale.xh)]);
                self.y1Scale = d3.scale.linear().range([self.data.height - self.data.margin.top, self.data.margin.bottom]).domain([self.axisScale.y1.yl, self.axisScale.y1.yh]);
                self.y2Scale = d3.scale.linear().range([self.data.height - self.data.margin.top, self.data.margin.bottom]).domain([self.axisScale.y2.yl, self.axisScale.y2.yh]);

                // self.xScale.ticks(5);
                //     tickFormat = self.xScale.tickFormat(5, "+%");
                //
                // ticks.map(tickFormat); // ["-100%", "-50%", "+0%", "+50%", "+100%"]
            }

        }


        vm.init = function () {
            loadMap();
            getTimelineObjects();

            vm.gotHistory = historyService.getData('getHistory');
            var tempSelectedvehicles = $scope.getMatches(mapService.filterStr);
            if (tempSelectedvehicles.length > 0) {
                vm.historyMap.selectedVehicle = tempSelectedvehicles[0];
            }

            if (vm.gotHistory) {
                historyService.drawTrace();
                //generateTimeline(vm.historyMap.traceObj);
                //generateExpandedGraph();
                //drawTimeline();
            } else {
                if ($stateParams && $stateParams.mapObj && $stateParams.mapObj.clickedMarker)
                    vm.historyMap.selectedVehicle = $stateParams.mapObj.clickedMarker;
                else
                    setDefaultVehicle();
            }

            createExpandedGraph();

            setMapHeight();
            $scope.$on('gotHistoryEvent', vm.gotHistoryEvent);
            $scope.$on('gotHistoryEventFailed', vm.gotHistoryEventFailed);

            geofenceViewService.addListener('getMyFences', vm.getMyFencesListener);
            historyService.addListener('loadMap', loadMap);

            historyFenceInfowindow.addListener('domready', function () {
                vm.historyFenceWindowLoad();
            });


        };

        vm.init();
    }


    function HistoryTableController($rootScope, $scope, $log, dialogService, intellicarAPI, historyService, $q) {

        $log.log('HistoryTableController');

        var vm = this;
        var dateFormat = 'DD-MM-YYYY HH:mm';

        dialogService.setTab(1);

        var historyData = [];
        vm.jsonHistoryData = [];
        var tableContainer = document.getElementById('geo-table');

        vm.historyMap = historyService.historyMap;

        vm.multiSelect = vm.historyMap.multiSelect;

        var MILLISEC = 1000;

        var hrs24 = 86400 * MILLISEC;

        var week = hrs24 * 7;
        var timeLimit = week;

        var table, data;

        vm.disableDownload = true;
        vm.showLoading = false;

        vm.convertLatLngToAddr = true;

        $scope.getHistory = function () {
            historyData = [];
            vm.jsonHistoryData = [];
            vm.disableDownload = true;
            vm.showLoading = true;
            if (table)
                table.clearChart(tableContainer);
            historyService.setData('getHistory', false);
            historyService.getHistoryData();
        };

        $rootScope.$on('gotHistoryEvent', function (event, data) {
            if (tableContainer == null) return;
            vm.showTableData();
        });

        vm.getAddress = function (latlng, className) {
            if (typeof(latlng) == 'string') {
                latlng = [latlng.split(',')];
                vm.myclass = className;
            }

            // var body = {
            //     data: latlng
            // };

            return intellicarAPI.geocodeService.getAddress(latlng);
            // .then(vm.gotAddress, vm.handleFailure);
        };
        //
        // vm.gotAddress = function (data) {
        //     $log.log(data);
        //     return;
        //     if (!data.data.data.length) return;
        //     var addr = data.data.data;
        //     for (var idx in addr)
        //         addr = addr[idx];
        //
        //
        //     if ( vm.convertLatLngToAddr ) {
        //         return addr[1];
        //     }else {
        //         var vehicleAddress = addr[1];
        //         $('.' + vm.myclass).attr('data-content', vehicleAddress)
        //         WebuiPopovers.updateContent('.' + vm.myclass, vehicleAddress) //Update the Popover content after the popover is created.
        //     }
        // };

        vm.showTableData = function () {
            var traceObj = vm.historyMap.traceObj;
            // $log.log(traceObj);
            historyData = [];

            var latlngList = [];

            for (var idx in traceObj) {
                latlngList.push([traceObj[idx].lat(), traceObj[idx].lng()]);
            }

            var addressList = [];
            if (traceObj != null) {
                if (vm.convertLatLngToAddr) {
                    vm.getAddress(latlngList).then(
                        function (resp) {     // On success
                            // $log.log(resp);
                            for (var idx in resp) {
                                addressList.push(resp[idx][1]);
                            }
                            getTableData(traceObj, addressList);
                        },

                        function (resp) {   // On failure
                            $log.log(resp);
                        }
                    );
                } else {
                    getTableData(traceObj, addressList);
                }
            }

            // $log.log(traceObj);

        };


        function getTableData(traceObj, addressList) {

            for (var idx in traceObj) {
                var loc = traceObj[idx].lat() + ',' + traceObj[idx].lng();
                var dateTime = new Date(traceObj[idx].gpstime);
                var ignitionStatus = traceObj[idx].ignstatus ? 'On' : 'Off';
                var location = "<span class='latlng loc" + idx + "' data-content='Fetching Address'>" + loc + "</span>";

                if (addressList.length) {
                    location = loc = addressList[idx];
                }
                historyData.push([
                    dateTime,
                    traceObj[idx].odometer.toString(),
                    traceObj[idx].speed.toString(),
                    ignitionStatus,
                    location
                ]);

                vm.jsonHistoryData.push({
                    vehicle_Name: vm.historyMap.selectedVehicle.rtgps.vehicleno,
                    time: moment(dateTime).format(dateFormat),
                    odometer: traceObj[idx].odometer.toString(),
                    speed: traceObj[idx].speed.toString(),
                    ignitionStatus: ignitionStatus,
                    location: loc
                });
            }


            // $log.log(traceObj);
            google.charts.load('current', {'packages': ['table']});
            google.charts.setOnLoadCallback(drawTable);

            vm.disableDownload = false;
            vm.showLoading = false;
        }


        function drawTable() {
            table = new google.visualization.Table(tableContainer);

            google.visualization.events.addListener(table, 'ready', function () {
                if (vm.convertLatLngToAddr) {

                } else {
                    $('.latlng').webuiPopover({trigger: 'hover', width: 300, animation: 'pop'});

                    $('.latlng').hover(function () {
                        var className = $(this).attr('class');
                        className = className.split(' ');
                        var latlng = $(this).text();
                        vm.getAddress(latlng, className[1]).then(function (resp) {
                            for (var idx in resp) {
                                if (resp[idx][1]) {
                                    var vehicleAddress = resp[idx][1];
                                    $('.' + vm.myclass).attr('data-content', vehicleAddress)
                                    WebuiPopovers.updateContent('.' + vm.myclass, vehicleAddress) //Update the Popover content after the popover is created.
                                    return;
                                }
                            }
                        }, function (resp) {
                            $log.log(resp);
                        });
                    });
                }
            });
            data = new google.visualization.DataTable();

            data.addColumn('datetime', 'Time');
            data.addColumn('string', 'Odometer');
            data.addColumn('string', 'Speed');
            data.addColumn('string', 'IgnitionStatus');
            data.addColumn('string', 'Location');

            data.addRows(
                historyData
            );

            var dateFormatter = new google.visualization.DateFormat({pattern: 'd MMM, h:mm a'});
            dateFormatter.format(data, 0);

            table.draw(data, {
                showRowNumber: true,
                width: '100%',
                page: 'enable',
                pageSize: 300,
                allowHtml: true
            });
        };

        $scope.downloadFile = function () {
            intellicarAPI.importFileservice.JSONToCSVConvertor(vm.jsonHistoryData, "Vehicles History Report", true);
        };


        vm.init = function () {
            if (vm.historyMap.traceObj.length) {
                vm.showTableData();
                vm.disableDownload = false;
            }

        };

        vm.init();
    }

})();
