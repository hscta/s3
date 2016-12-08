/**
 * Created by Rinas Musthafa on 11/27/2016.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('HistoryController', HistoryController)
        .controller('HistoryTableController', HistoryTableController);

    function HistoryController($scope, $window, $interval, historyService, $stateParams, $log,$timeout,
                                dialogService, geofenceViewService, $compile) {

        var vm = this;

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
                var keys = Object.keys(vm.historyMap.vehiclesByPath);
                if (keys.length > 0) {
                    $log.log(vm.historyMap.vehiclesByPath[keys[0]]);
                    vm.historyMap.selectedVehicle = vm.historyMap.vehiclesByPath[keys[0]];
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
                        vm.traceControls.current = -1;
                    }
                    vm.traceControls.current++;
                    vm.traceControls.moveTimeline();
                }, vm.traceControls.SPEEDS[vm.traceControls.speed]);
            }
        };

        vm.traceControls.moveTimeline = function () {
            if (vm.historyMap.startMarker) {
                var left = vm.traceControls.current / vm.traceControls.timeline.length * 100;
                vm.traceControls.pointer.css({'left': left + '%'});
                vm.historyMap.startMarker.setPosition(vm.traceControls.timeline[vm.traceControls.current]);
                moveMapWithMarker(vm.historyMap.startMarker);
            }
        };


        var moveMapWithMarker = function (marker) {
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
            if(graphLineLimit < 10)
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
            if(highestSpeed < 60){
                highestSpeed = 60;
            }
            highestSpeed += 20 + vm.traceControls.graphBase;
            vm.traceControls.ctx.beginPath();
            vm.traceControls.ctx.moveTo(0, vm.traceControls.ch - vm.traceControls.graphBase);
            vm.traceControls.ctx.strokeStyle = 'rgba(255, 69, 0, 0.77)';
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
            // setting and resetting track history  variables
            vm.traceControls.selectedVehicle = vm.historyMap.selectedVehicle;
            vm.traceControls.panel.clicked = true;

            var timeline = [];
            var first = angular.copy(path[0]);
            var last = angular.copy(path[path.length - 1]);
            var currentTime = first.gpstime;
            var currentPathIdx = 0;

            while (currentTime < last.gpstime ) {
                if(path[currentPathIdx].speed < 2){
                    path[currentPathIdx].speed = 0;
                }
                if (path[currentPathIdx].gpstime < currentTime) {
                    if(currentPathIdx < path.length) {
                        path[currentPathIdx].gpstime = currentTime;
                        timeline.push(path[currentPathIdx]);
                    }
                    currentPathIdx++;
                } else {
                    timeline.push(path[currentPathIdx]);
                }
                currentTime += vm.traceControls.interval;
            }
            vm.traceControls.timeline = timeline;
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

        getTimelineObjects();
        vm.gotHistoryEvent = function (event, data) {
            vm.gotHistory = historyService.getData('getHistory');
            setMapHeight();
            generateTimeline(data.path);
            generateExpandedGraph(data.path);
            drawTimeline();
        }

        vm.gotHistoryEventFailed = function () {
            vm.gotHistory = historyService.getData('getHistory');
            setMapHeight();
        }

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

        vm.toggleExpandedGraphs = function () {
            if(!vm.traceControls.expandedGraphs){
                vm.traceControls.expandedGraphs = true;
            }else{
                vm.traceControls.expandedGraphs = false;
            }
            $timeout(function () {
                moveMapWithMarker(vm.historyMap.startMarker);
            },1000);
        }


        function generateExpandedGraph() {
            for(var idx in vm.tcGraphs.charts){
                parseToGraphData(vm.tcGraphs.charts[idx], vm.traceControls.timeline);
            }
        }
        function parseToGraphData(object, data) {
            var graphs = object.graphs;
            var genGraphs = [];
            var values;
            for(var jdx in graphs){
                graphs[jdx].originalKey = graphs[jdx].key;
                values = [];
                for(var idx in data){
                    values.push({
                        x:data[idx].gpstime,
                        y:data[idx][graphs[jdx].item]
                    })
                }
                graphs[jdx].values = values;
                genGraphs.push(graphs[jdx]);
            }
            object.data = genGraphs;
        }






        //
        //
        // var datas = [
        //     {
        //         color:"#e74c3c",
        //         values : [[ "12", "2000"],["149", "2002"],["124","2004"],["300","2006"]["200","2008"],["106","2010"]]
        //     },
        //     {
        //         color:"#e74c3c",
        //         values : [[ "152", "2000"],["189", "2002"],["179","2004"],["199","2006"]["134","2008"],["176","2010"]]
        //     }
        // ]
        //
        //
        // var d3graph1 = new d3Graph({
        //     svg : "#visualisation",
        //     width : 900,
        //     height : 400,
        //     data : datas,
        // });
        //
        // d3graph1.draw();
        //
        // function d3Graph(settings) {
        //     var d3g = this;
        //     d3g.settings = settings;
        //     if(!d3g.settings.margin){
        //         d3g.settings.margin = {
        //             top: 20,
        //             right: 20,
        //             bottom: 20,
        //             left: 50
        //         }
        //     }
        //     d3g.vis = d3.select(settings.svg);
        //
        //     d3g.draw = function () {
        //
        //         d3g.xScale = d3.scale.linear().range([d3g.settings.margin.left, d3g.settings.width - d3g.settings.margin.right]).domain([2000, 2010]);
        //         d3g.yScale = d3.scale.linear().range([d3g.settings.height - d3g.settings.margin.top, d3g.settings.margin.bottom]).domain([134, 215]);
        //
        //         // Drawing axis
        //         d3g.xAxis = d3.svg.axis()
        //             .scale(d3g.xScale);
        //
        //         d3g.yAxis = d3.svg.axis()
        //             .scale(d3g.yScale)
        //             .orient("left");
        //         // appending axis
        //         d3g.vis.append("svg:g")
        //             .attr("class","axis")
        //             .attr("transform", "translate(0," + (d3g.settings.height - d3g.settings.margin.bottom) + ")")
        //             .call(d3g.xAxis);
        //         d3g.vis.append("svg:g")
        //             .attr("class","axis")
        //             .attr("transform", "translate(" + (d3g.settings.margin.left) + ",0)")
        //             .call(d3g.yAxis);
        //
        //
        //
        //         d3g.lineGen = d3.svg.line()
        //             .x(function(d) {
        //                 return d3g.xScale(d[0]);
        //             })
        //             .y(function(d) {
        //                 return d3g.yScale(d[1]);
        //             })
        //             .interpolate("basis"); // for smoothening the lines
        //
        //         for(var idx in d3g.settings.data){
        //             d3g.vis.append('svg:path')
        //                 .attr('d', d3g.lineGen(d3g.settings.data[idx].values))
        //                 .attr('stroke', d3g.settings.data[idx].color )
        //                 .attr('stroke-width', 1)
        //                 .attr('fill', 'none');
        //         }
        //
        //     }
        // }
        //
        //
        //







        vm.tcGraphs  = {
            options : {
                chart: {
                    type: 'multiChart',
                    margin: {
                        top: 30,
                        right: 60,
                        bottom: 50,
                        left: 70
                    },
                    color: d3.scale.category10().range(),
                    //useInteractiveGuideline: true,
                    duration: 500,
                    xAxis: {
                        tickFormat: function (d) {
                            return d3.time.format('%H:%M %b %d')(new Date(d))
                        }
                    },
                    yAxis1: {
                        tickFormat: function (d) {
                            return d3.format(',.1f')(d);
                        }
                    },
                    yAxis2: {
                        tickFormat: function (d) {
                            return d3.format(',.1f')(d);
                        }
                    }
                },
            },
            charts : [
                // {
                //     data: [],
                //     graphs: [{color: '#e74c3c', key: 'Speed', type: 'line', item: 'speed', yAxis: 1}],
                // },
                {
                    data: [],
                    graphs: [{color: '#3498db', key: 'Car battery', type: 'line', item: 'carbattery', yAxis: 1},
                        {color: '#e74c3c', key: 'Dev battery', type: 'line', item: 'devbattery', yAxis: 2}],
                }, {
                    data: [],
                    graphs: [{color: '#2ecc71', key: 'GPS Signal', type: 'line', item: 'numsat', yAxis: 1}],
                },
                // {
                //     data: [],
                //     graphs: [{color: '#e67e22', key: 'Something', type: 'line', item: 'speed', yAxis: 1}],
                // },
            ]
        }










        vm.init = function () {
            loadMap();
            vm.gotHistory = historyService.getData('getHistory');

            if (vm.gotHistory) {
                historyService.drawTrace();
                generateTimeline(vm.historyMap.traceObj);
                generateExpandedGraph();
                drawTimeline();
            } else {
                if ($stateParams && $stateParams.mapObj && $stateParams.mapObj.clickedMarker)
                    vm.historyMap.selectedVehicle = $stateParams.mapObj.clickedMarker;
                else
                    setDefaultVehicle();
            }

            setMapHeight();
            $scope.$on('gotHistoryEvent', vm.gotHistoryEvent);
            $scope.$on('gotHistoryEventFailed', vm.gotHistoryEventFailed);

            // $log.log(vm.historyMap.markersByPath);
            // $log.log($stateParams.mapObj);


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
            latlng = latlng.split(',');
            vm.myclass = className;
            var body = {
                data: [latlng]
            };
            var promise = (intellicarAPI.geocodeService.getAddress(body));
            return $q.resolve(promise)
                .then(vm.gotAddress, vm.handleFailure);
        };

        vm.gotAddress = function (data) {
            if (!data.data.data.length) return;
            var addr = data.data.data;
            for (var idx in addr)
                addr = addr[idx];
            var vehicleAddress = addr[1]
            $('.' + vm.myclass).attr('data-content', vehicleAddress)
            WebuiPopovers.updateContent('.' + vm.myclass, vehicleAddress) //Update the Popover content after the popover is created.
        };

        vm.showTableData = function () {
            var marker = vm.historyMap.traceObj;
            // $log.log(marker);
            historyData = [];

            for (var idx in marker) {
                var loc = marker[idx].lat() + ',' + marker[idx].lng();
                var dateTime = new Date(marker[idx].gpstime);
                var ignitionStatus = marker[idx].ignstatus ? 'On' : 'Off';

                var location = "<span class='latlng loc" + idx + "' data-content='Fetching Address'>" + loc + "</span>";

                historyData.push([
                    dateTime,
                    marker[idx].odometer.toString(),
                    marker[idx].speed.toString(),
                    ignitionStatus,
                    location
                ]);

                vm.jsonHistoryData.push({
                    vehicle_Name: vm.historyMap.selectedVehicle.rtgps.vehicleno,
                    time: moment(dateTime).format(dateFormat),
                    odometer: marker[idx].odometer.toString(),
                    speed: marker[idx].speed.toString(),
                    ignitionStatus: ignitionStatus,
                    location: loc
                });
            }
            google.charts.load('current', {'packages': ['table']});
            google.charts.setOnLoadCallback(drawTable);

            vm.disableDownload = false;
            vm.showLoading = false;
        };

        function drawTable() {
            table = new google.visualization.Table(tableContainer);
            data = new google.visualization.DataTable();

            data.addColumn('datetime', 'Time');
            data.addColumn('string', 'Odometer');
            data.addColumn('string', 'Speed');
            data.addColumn('string', 'IgnitionStatus');
            data.addColumn('string', 'Location');

            data.addRows(
                historyData
            );

            google.visualization.events.addListener(table, 'ready', function () {
                $('.latlng').webuiPopover({trigger: 'hover', width: 300, animation: 'pop'});
            });

            var dateFormatter = new google.visualization.DateFormat({pattern: 'd MMM, h:mm a'});
            dateFormatter.format(data, 0);

            table.draw(data, {
                showRowNumber: true,
                width: '100%',
                page: 'enable',
                pageSize: 300,
                allowHtml: true
            });

            $('.latlng').hover(function () {
                var className = $(this).attr('class');
                className = className.split(' ');
                var latlng = $(this).text();
                vm.getAddress(latlng, className[1]);
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
