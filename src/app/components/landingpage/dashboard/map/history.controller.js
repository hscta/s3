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


        vm.downloadScreenShot = function () {
            var mapWidth = $('#history_map').width();
            var mapHeight = $('#history_map').height();
            //$('#history_map [style*=transform]')[0]
            //html2canvas(document.getElementById('history_map'), {"onrendered":function(canvas) {
            var abcd = $('#history_map [style*=transform]');
            var reqelem = abcd[0];
            if (reqelem.style['z-index'] == '4') {
                reqelem = abcd[1];
            }
            reqelem = $(reqelem);
            var ignoreList = [
                $('#history_map .gmnoprint img')[0],
                $('#history_map .gm-style .gm-style-pbc .gm-style-pbt'),
                $('#history_map > div > .gm-style > .gmnoprint > .gm-style-mtc'),
                $('#history_map > div > .gm-style > .gmnoprint.gm-bundled-control.gm-bundled-control-on-bottom')[0]
            ]

            for(var idx in ignoreList){
                $(ignoreList[idx]).attr('data-html2canvas-ignore', 'true');
            }

            var transform=reqelem.css("transform")
            var comp=transform.split(",") //split up the transform matrix
            var mapleft=parseFloat(comp[4]) //get left value
            if (isNaN(mapleft))
                mapleft = 0;
            var maptop=parseFloat(comp[5])  //get top value
            if (isNaN(maptop))
                maptop = 0;
            reqelem.css({ //get the map container. not sure if stable
                "transform":"none",
                "left":mapleft,
                "top":maptop,
            });
            if (abcd.length > 1){
                $(abcd[1]).css({ //get the map container. not sure if stable
                    "transform":"none",
                    "left":mapleft,
                    "top":maptop,
                });
            }

            html2canvas($('#history_map'), {
                "logging": true,
                "onrendered":function(canvas) {
                var mapImage = new Image();
                    mapImage.src = canvas.toDataURL("image/png")

                // window.open(mapImage);

                    var mapImageObj = {
                        height: mapHeight,
                        width: mapWidth,
                        image: mapImage
                    }

                    createCanvasForDownload(mapImageObj);
                reqelem.css({
                    left:0,
                    top:0,
                    "transform":transform
                });
                    if (abcd.length > 1){
                        $(abcd[1]).css({ //get the map container. not sure if stable
                            "transform":transform,
                            "left":0,
                            "top":0,
                        });
                    }
            },
                width : mapWidth,
                height: mapHeight,
                useCORS : true
        });
        }

        function createCanvasForDownload(mapImage) {
            var canParent = $('.downloadImage')

            var dCanvas = document.createElement('canvas');
            dCanvas.id     = "downloadImageCanvas";
            dCanvas.width  = canParent.width();
            dCanvas.height = canParent.height();
            canParent.append(dCanvas);

            var ctx = dCanvas.getContext("2d");
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canParent.width(), canParent.height());
            ctx.drawImage(mapImage.image, 10, 10 , mapImage.width , mapImage.height);

            renderSvgToCanvas({idx: 0, left: 10, top: mapImage.height + 20 , parent: true});
            renderSvgToCanvas({idx: 1, left: mapImage.width, top: 0, childGraph:true});
            renderSvgToCanvas({idx: 2, left: mapImage.width, top: 1, childGraph:true});
            renderSvgToCanvas({idx: 3, left: mapImage.width, top: 2, childGraph:true});

            var texts = [
                moment.utc(vm.getCurrentPos().gpstime).format('d MMM YY, h:mm:ss A'),
                'Ignition : ' + (vm.getCurrentPos().ignstatus ? 'On' : 'Off'),
                'Speed : ' + vm.getCurrentPos().speed + 'kmph',
                'Odometer : ' + vm.getCurrentPos().odometer + ' km',
                vm.traceControls.selectedVehicle.rtgps.meta.cartype,
            ];

            for(var idx in texts){
                var counter = texts.length - idx;
                var tLeft = mapImage.width + 40;
                ctx.font="12px gotham";
                ctx.fillStyle = '#777';
                var tTop = canParent.height() - 20 - ( 22 * counter );
                ctx.fillText(texts[idx], tLeft, tTop);
            }

            var renderedImgCount = 0;
            function afterImageRender() {
                renderedImgCount++;
                if(renderedImgCount >= 4){
                    setTimeout(function () {
                        var a = $("<a>")
                            .attr("href", dCanvas.toDataURL("image/png"))
                            .attr("download", "img.png")
                            .appendTo("body");
                        a[0].click();
                    },100)
                }
            }

            function renderSvgToCanvas(param) {

                var idx = param.idx;
                var left = param.left;
                var top = param.top;

                var svg = $(vm.tcGraphs.charts[idx].data.svg);
                vm.tcGraphs.charts[idx].object.vis.attr("transform", "translate(0,0) scale(1, 0.69)");
                vm.tcGraphs.charts[idx].object.visAxis.attr("transform", "translate(0,0) scale(1, 0.69)");

                var svgHeight = svg.height();
                var svgWidth  = svg.width();

                if(param.childGraph){
                    svgHeight = svgHeight - ( svgHeight * 0.05 );
                    left += 20;
                    svgWidth -= 20;
                    top = ((svg.height() ) * top ) + 10;
                }

                if(param.parent){
                    svgHeight = svgHeight + ( svgHeight * 0.2 );
                    top = canParent.height() - svgHeight - 20;
                    svgWidth = mapImage.width;
                    ctx.strokeStyle = '#777';
                    ctx.strokeRect(left, top, svgWidth, svgHeight);
                }

                var data = (new XMLSerializer()).serializeToString(svg[0]);
                var DOMURL = window.URL || window.webkitURL || window;
                var img = new Image();
                var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
                var url = DOMURL.createObjectURL(svgBlob);
                img.onload = function () {
                    ctx.drawImage(img, left, top, svgWidth, svgHeight);
                    vm.tcGraphs.charts[idx].object.vis.attr("transform", "translate(0,0) scale(1, 1)");
                    vm.tcGraphs.charts[idx].object.visAxis.attr("transform", "translate(0,0) scale(1, 1)");
                    afterImageRender();
                };
                img.src = url;
            }

        }

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
            vm.gotData = false;
            vm.loadingData = true;
            setMapHeight();
            historyService.setData('getHistory', false);
            historyService.getHistoryData();
        };

        function setMapHeight() {
            if (vm.gotData) {
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
            if (vm.traceControls.current + time < vm.traceControls.startIndex) {
                vm.traceControls.current = 0;
                vm.traceControls.moveTimeline();
            } else if (vm.traceControls.current + time > vm.traceControls.endIndex) {
                vm.traceControls.current = vm.traceControls.timeline.length - 1;
                vm.traceControls.moveTimeline();
            } else if(vm.traceControls.current + time < vm.traceControls.startIndex){
                vm.traceControls.current += time;
                vm.traceControls.moveTimeline();
            }
        };

        vm.traceControls.jumpToAlarm = function (opcode) {
            var idx=vm.traceControls.current + opcode;
            while( idx < vm.traceControls.endIndex && idx >= 0){
                if(vm.traceControls.timeline[idx].alarmData){
                    vm.traceControls.current = idx;
                    vm.traceControls.moveTimeline();
                    break;
                }
                idx+=opcode;
            }
        }

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
            if (vm.traceControls.timeline.length > vm.traceControls.startIndex && vm.traceControls.current < vm.traceControls.endIndex) {
                vm.traceControls.panel.clicked = false;
                vm.traceControls.playing = true;
                if (vm.traceControls.engine) {
                    $interval.cancel(vm.traceControls.engine);
                }
                vm.traceControls.current++;
                vm.traceControls.moveTimeline();
                vm.traceControls.engine = $interval(function () {
                    if (vm.traceControls.current >= vm.traceControls.endIndex) {
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
            if (vm.historyMap.startMarker && vm.traceControls.current < vm.traceControls.endIndex) {
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
            highestSpeed += 30 + vm.traceControls.graphBase;
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
            vm.traceControls.ctx.lineTo(vm.traceControls.timeline.length * vm.traceControls.wr, vm.traceControls.ch - vm.traceControls.graphBase);
            vm.traceControls.ctx.lineTo(0, vm.traceControls.ch - vm.traceControls.graphBase);
            vm.traceControls.ctx.closePath();
            vm.traceControls.ctx.stroke();
            vm.traceControls.ctx.fill();

            vm.traceControls.alarmArray = [];
            for (var idx in vm.traceControls.timeline){
                if(vm.traceControls.timeline[idx].alarmData){
                    var alarm = vm.traceControls.timeline[idx].alarmData;

                    vm.traceControls.ctx.lineWidth = 3;
                    vm.traceControls.ctx.beginPath();
                    vm.traceControls.ctx.strokeStyle = 'rgba(241, 196, 15,1.0)';
                    // vm.traceControls.ctx.fillStyle = 'rgba(230, 126, 34,0.05)';
                    vm.traceControls.ctx.arc(idx * vm.traceControls.wr,23,4,0,2*Math.PI);
                    vm.traceControls.ctx.stroke();
                    // vm.traceControls.ctx.fill();

                    vm.traceControls.alarmArray.push({
                        x:idx * vm.traceControls.wr,
                        y:23,
                        r:4,
                        idx:idx
                    })
                }
            }

        }

        function generateTimeline(data) {
            var path = data.path;
            var alarmData = data.alarm;
            var alarmIdx = 0;

            if(path.length < 1){
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
                    if(alarmData.length > alarmIdx && Math.abs(alarmData[alarmIdx].gpstime - path[currentPathIdx].gpstime) <= 30000 ){
                        if(vm.traceControls.excludedAlarm.indexOf(alarmData[alarmIdx].alarmreason) == -1){
                            path[currentPathIdx].alarmData = alarmData[alarmIdx];
                        }
                        alarmIdx++;
                    }
                    timeline.push(path[currentPathIdx]);
                    currentTime = path[currentPathIdx].gpstime + vm.traceControls.interval;
                    currentPathIdx++;
                } else { // dummy points
                    var dummy = getDefaultGraphObject(path[currentPathIdx]);
                    dummy.gpstime = currentTime;
                    timeline.push(dummy);
                    currentTime += vm.traceControls.interval;
                }
            }
            vm.traceControls.timeline = timeline;

            vm.traceControls.startIndex = 0;
            vm.traceControls.endIndex = vm.traceControls.timeline.length;
        }

        function mouseIsInsideCircle(mouseX,mouseY,cx,cy,radius){
            var dx=mouseX-cx;
            var dy=mouseY-cy;
            return(dx*dx+dy*dy<=radius*radius);
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
            // vm.traceControls.panel.element.mousedown(function (event) {
            //
            //         if (!vm.traceControls.playing) {
            //             if (!vm.traceControls.panel.clicked) {
            //                 vm.traceControls.panel.clicked = true;
            //             } else {
            //                 vm.traceControls.panel.clicked = false;
            //             }
            //         }
            //
            //         vm.traceControls.pointer.css('transition', 0 + 'ms linear');
            //         vm.traceControls.mouseMoveEvent(event);
            // });
            // $($window).mouseup(function () {
            //     // vm.traceControls.panel.clicked = false;
            //     // vm.traceControls.pointer.css('transition', vm.traceControls.SPEEDS[vm.traceControls.speed] + 'ms linear');
            // });
            // vm.traceControls.panel.element.mousemove(function (event) {
            //
            //     var clickedOnCircle = false;
            //     // if the mouse is inside the circle
            //     var cpos = $(vm.traceControls.myCanvas).offset();
            //     for(idx in vm.traceControls.alarmArray){
            //         var msp = vm.traceControls.alarmArray[idx];
            //         if(mouseIsInsideCircle(event.pageX - cpos.left, event.pageY - cpos.top, msp.x, msp.y, msp.r+1)){
            //             vm.traceControls.panel.clicked = false;
            //             vm.traceControls.current = msp.idx;
            //             vm.traceControls.moveTimeline();
            //             clickedOnCircle = true;
            //         }
            //     }
            //     if(!clickedOnCircle){
            //         if (vm.traceControls.panel.clicked) {
            //             vm.traceControls.setPointerTransition(false);
            //             vm.traceControls.mouseMoveEvent(event);
            //         }
            //     }
            // });

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
                    if(event.ctrlKey){
                        vm.traceControls.jumpToAlarm(-1);
                    }else {
                        vm.traceControls.jumpToTime(-1);
                    }
                } else if (event.keyCode == 38) { // up
                    vm.traceControls.jumpToTime(10);
                } else if (event.keyCode == 39) { // right
                    if(event.ctrlKey){
                        vm.traceControls.jumpToAlarm(1);
                    }else{
                        vm.traceControls.jumpToTime(1);
                    }
                } else if (event.keyCode == 40) { // down
                    vm.traceControls.jumpToTime(-10);
                }
                // }
            });
        }

        vm.getPopLeft = function () {
            if(vm.traceControls.myCanvas == null)
                return 0;
            return (( vm.traceControls.current * vm.traceControls.wr ) + $(vm.traceControls.myCanvas).offset().left) + 'px';
        };

        vm.gotHistoryEvent = function (event, data) {
            vm.gotHistory = historyService.getData('getHistory');
            vm.gotData = true;
            vm.loadingData = false;
            setMapHeight();
            generateTimeline(data);
            generateExpandedGraph();
            // drawTimeline();
        };

        vm.gotHistoryEventFailed = function () {
            vm.gotData = false;
            vm.loadingData = false;
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
                resizeTcGraphs();
                moveMapWithMarker(vm.historyMap.startMarker);
            }, 1000);
        };

        function createExpandedGraph(callback) {
            // if(vm.traceControls.expDiv == null){
                var tempInter = $interval(function () {
                    if ($('.tc_panel, .tcg_item').length > 1) {
                        $interval.cancel(tempInter);
                        vm.traceControls.expDiv = $('.tcg_item');
                        vm.traceControls.expDivParent = $('.tc_panel');

                        for (var idx in vm.tcGraphs.charts) {
                            if(vm.tcGraphs.charts[idx].data.parent){
                                vm.tcGraphs.charts[idx].data.height = vm.traceControls.expDivParent.height() ;
                                vm.tcGraphs.charts[idx].data.width = vm.traceControls.expDivParent.width();
                            }else{
                                vm.tcGraphs.charts[idx].data.height = vm.traceControls.expDiv.height() - 30;
                                vm.tcGraphs.charts[idx].data.width = vm.traceControls.expDiv.width();
                            }
                            if (!vm.tcGraphs.charts[idx].data.margin)
                                vm.tcGraphs.charts[idx].data.margin = vm.tcGraphs.margin;

                            if(vm.tcGraphs.charts[idx].data.parent){ // creating bar chart Data

                                var ignChart = {color:'#3498db', values:[]}
                                var movingChart = {color:'#2ecc71', values:[]}
                                vm.tcGraphs.charts[idx].data.barCharts = []
                                var ign_rect = {};
                                var moving_rect = {};
                                var pre_ignstatus = false;
                                var pre_moving = false;
                                for (var jdx in vm.traceControls.timeline) {
                                    var ignition = vm.traceControls.timeline[jdx].ignstatus;
                                    var moving = false;
                                    if (vm.traceControls.timeline[jdx].speed > vm.traceControls.speedThreshold) {
                                        moving = true;
                                    }
                                    if (ignition && !pre_ignstatus) {
                                        ign_rect.x1 = jdx;
                                    } else if (!ignition && pre_ignstatus) {
                                        ign_rect.x2 = jdx;
                                        ignChart.values.push(ign_rect);
                                        ign_rect = {};
                                    }
                                    if (moving && !pre_moving) {
                                        moving_rect.x1 = jdx;
                                    } else if (!moving && pre_moving) {
                                        moving_rect.x2 = jdx;
                                        movingChart.values.push(moving_rect);
                                        moving_rect = {};
                                    }
                                    pre_ignstatus = ignition;
                                    pre_moving = moving;
                                }
                                vm.tcGraphs.charts[idx].data.barCharts.push(ignChart);
                                vm.tcGraphs.charts[idx].data.barCharts.push(movingChart);
                            }
                            vm.tcGraphs.charts[idx].object = new d3Graph(vm.tcGraphs.charts[idx]);
                        }
                        $(window).resize(function () {
                            resizeTcGraphs();
                        });
                        if(callback) callback();
                    }
                }, 200);
            // }else{
            //     if(callback) callback();
            // }
        }

        function resizeTcGraphs() {
            //
            // for (var idx in vm.tcGraphs.charts) {
            //     vm.tcGraphs.charts[idx].object.data.height = vm.traceControls.expDiv.height() - 30;
            //     vm.tcGraphs.charts[idx].object.data.width = vm.traceControls.expDiv.width();
            //     vm.tcGraphs.charts[idx].object.draw();
            // }

        }

        function generateExpandedGraph() {
            createExpandedGraph(function () {
                for (var idx in vm.tcGraphs.charts) {
                    parseToGraphData(vm.tcGraphs.charts[idx], vm.traceControls.timeline);
                    vm.tcGraphs.charts[idx].object.draw(vm.tcGraphs.charts[idx].graphs);
                }
            })
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
            mouseclicked : false,
            margin: {left: 35, right: 35, top: 20, bottom: 20},
            charts: [
                {
                    data: {svg: '#visualisation-parent', parent:true, margin: {left: 0, right: 0, top: 0, bottom: 0},},
                    graphs: [{color: '#e74c3c', key: 'Speed', type: 'line', item: 'speed', unit: 'kmph', yAxis: 1}],
                },
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
                        }]
                },
                {
                    data: {svg: '#visualisation3'},
                    graphs: [{color: '#2ecc71', key: 'GPS Signal', type: 'line', item: 'numsat', unit: '', yAxis: 1}],
                }
            ]
        };

        vm.tcGraphs.zoom = function (animate) {
            // Do getbounds here
            vm.traceControls.startIndex = binSearch(vm.traceControls.timeline, vm.tcGraphs.zoomStart, 'gpstime');
            vm.traceControls.current = angular.copy(vm.traceControls.startIndex);
            vm.traceControls.endIndex = binSearch(vm.traceControls.timeline, vm.tcGraphs.zoomEnd, 'gpstime');
            var tempTimeline = angular.copy(vm.traceControls.timeline);
            historyService.drawPolylines(tempTimeline, vm.traceControls.startIndex, vm.traceControls.endIndex);
            if(!animate){
                for(var idx in vm.tcGraphs.charts){
                    vm.tcGraphs.charts[idx].object.xScale.domain([new Date(vm.tcGraphs.zoomStart), new Date(vm.tcGraphs.zoomEnd)]);
                    vm.tcGraphs.charts[idx].object.redraw();
                }
            }else{
                var zStartInit = animate.x1;
                var zEndInit = animate.x2;
                var zStartTemp = vm.tcGraphs.zoomStart - zStartInit;
                var zEndTemp = vm.tcGraphs.zoomEnd - zEndInit;
                $interval(function () {
                    zStartInit += zStartTemp / 4;
                    zEndInit += zEndTemp / 4;
                    for(var idx in vm.tcGraphs.charts){
                        vm.tcGraphs.charts[idx].object.xScale.domain([new Date(zStartInit), new Date(zEndInit)]);
                        vm.tcGraphs.charts[idx].object.redraw();
                        // vm.tcGraphs.charts[idx].object.vis.attr('transform', 'translate(100, 0)');
                    }
                },10, 4);
                // vm.tcGraphs.charts[idx].object.vis.attr('transform', 'translate(100, 0)');
            }
        }

        vm.tcGraphs.seekGraph = function (key) {
            if(vm.tcGraphs.zoomEnd){
                var parentGraph = vm.tcGraphs.charts[0].object;
                var zMax = parentGraph.axisScale.xh;
                var zMin = parentGraph.axisScale.xl;
                var zoomAmount = (vm.tcGraphs.zoomEnd - vm.tcGraphs.zoomStart) / 2;
                if(key == 1){// rightButton
                    if(vm.tcGraphs.zoomEnd + zoomAmount > zMax){
                        zoomAmount = zMax - vm.tcGraphs.zoomEnd;
                    }
                }else{ // left button
                    if(vm.tcGraphs.zoomStart - zoomAmount < zMin){
                        zoomAmount = vm.tcGraphs.zoomStart - zMin;
                    }
                    zoomAmount *= -1;
                }
                zoomAmount = parseInt(zoomAmount);
                var anim = { x1 : vm.tcGraphs.zoomStart, x2 : vm.tcGraphs.zoomEnd}
                vm.tcGraphs.zoomEnd += zoomAmount;
                vm.tcGraphs.zoomStart += zoomAmount;

                var zStartTemp = vm.tcGraphs.zoomStart - anim.x1;
                var zEndTemp = vm.tcGraphs.zoomEnd - anim.x2;
                if(zStartTemp < 3000 && zEndTemp < 3000 && key == 1 || zStartTemp > -3000 && zEndTemp > -3000 && key < 1){
                    return;
                }

                vm.tcGraphs.zoom(anim);
            }
        }

        vm.tcGraphs.restoreGraph = function () {
            vm.tcGraphs.zoomEnd = null;
            vm.traceControls.startIndex = 0;
            vm.traceControls.endIndex = vm.traceControls.timeline.length;
            historyService.drawPolylines(vm.traceControls.timeline, vm.traceControls.startIndex, vm.traceControls.endIndex);
            for(var idx in vm.tcGraphs.charts){
                vm.tcGraphs.charts[idx].object.xScale.domain([new Date(vm.tcGraphs.charts[idx].object.axisScale.xl), new Date(vm.tcGraphs.charts[idx].object.axisScale.xh)]);
                vm.tcGraphs.charts[idx].object.redraw();
            }
        }

        function d3Graph(param) {
            var self = this;
            self.data = param.data;
            self.chart = param;

            self.visP = d3.select(self.data.svg)
            //responsive SVG needs these 2 attributes and no width and height attr
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + self.data.width + " " + (self.data.height - 30))
                //class to make it responsive
                .classed("svg-content-responsive", true)
                .on("contextmenu", function(d) { d3.event.preventDefault(); })
                .on("mousemove", mouseHoverEvent)
                .on("mousedown", graphStartDrag)
                .on("mouseup", graphEndDrag)


            function graphStartDrag() {
                self.mouseX = d3.mouse(this)[0];
                if(d3.event.button == 0){
                    if(!vm.tcGraphs.mouseclicked) {
                        if (self.mouseX > self.data.margin.left && self.mouseX < self.data.width - self.data.margin.right) {
                            vm.tcGraphs.mouseclicked = true;
                            vm.tcGraphs.zoomStartX = angular.copy(self.mouseX);
                            vm.tcGraphs.zoomStartTemp = parseInt(self.xScale.invert(self.mouseX));

                            self.selectRect
                                .attr('x', vm.tcGraphs.zoomStartX)
                                .attr('y', self.data.margin.top)
                                .attr('width', 0)
                                .attr('fill', 'rgba(255,0,0,0.2)')
                                .attr('height', self.data.height - self.data.margin.top - self.data.margin.bottom)
                        }
                    }
                }else if(d3.event.button == 2){
                    d3.event.preventDefault();
                    vm.tcGraphs.restoreGraph();
                }
            }

            function graphEndDrag() {
                if(d3.event.button == 0){
                    if(vm.tcGraphs.mouseclicked){
                        vm.tcGraphs.mouseclicked = false;
                        self.mouseX = d3.mouse(this)[0];
                        vm.tcGraphs.zoomEndTemp = parseInt(self.xScale.invert(self.mouseX));
                        if(Math.abs(vm.tcGraphs.zoomEndTemp - vm.tcGraphs.zoomStartTemp) > 1000 * 60 * 2){
                            vm.tcGraphs.zoomStart = angular.copy(vm.tcGraphs.zoomStartTemp);
                            vm.tcGraphs.zoomEnd = angular.copy(vm.tcGraphs.zoomEndTemp);
                            if(vm.tcGraphs.zoomEnd < vm.tcGraphs.zoomStart){
                                var tempStartZoom = vm.tcGraphs.zoomStart;
                                vm.tcGraphs.zoomStart = angular.copy(vm.tcGraphs.zoomEnd);
                                vm.tcGraphs.zoomEnd = tempStartZoom;
                            }
                            vm.tcGraphs.zoom();
                        }else{
                            if(vm.traceControls.playing){
                                var timestamp = parseInt(self.xScale.invert(self.mouseX));
                                vm.traceControls.updateAllTimelines(timestamp);
                                vm.traceControls.moveTimeline();
                            }else{
                                vm.traceControls.panel.clicked = !vm.traceControls.panel.clicked;
                            }
                            self.selectRect
                                .attr('y',-1000)
                            self.timePopRight
                                .attr("transform", "translate(0,-1000)")
                        }
                    }
                }
            }

            function mouseHoverEvent() {
                self.mouseX = d3.mouse(this)[0];
                self.mouseY = d3.mouse(this)[1];
                if(!vm.tcGraphs.mouseclicked){
                    if (self.xScale != null && self.mouseX >= self.data.margin.left && self.mouseX <= (self.data.width - self.data.margin.right)
                        && self.mouseY >= self.data.margin.top && self.mouseY <= (self.data.height - self.data.margin.bottom )) {
                        if(vm.traceControls.panel.clicked){
                            var timestamp = parseInt(self.xScale.invert(self.mouseX));
                            vm.traceControls.updateAllTimelines(timestamp);
                            vm.traceControls.moveTimeline();
                        }
                    }
                }else{
                    var tempMouseX = angular.copy(self.mouseX);
                    if(tempMouseX < self.data.margin.left)
                        tempMouseX = self.data.margin.left;

                    if(tempMouseX > self.data.width - self.data.margin.right)
                        tempMouseX = self.data.width - self.data.margin.right;

                    var selectRectWidth = tempMouseX - vm.tcGraphs.zoomStartX;
                    if(vm.tcGraphs.zoomStartX > tempMouseX){
                        selectRectWidth = vm.tcGraphs.zoomStartX - tempMouseX;
                        self.selectRect.attr('x',tempMouseX);
                    }
                    self.selectRect.attr('width',selectRectWidth);

                    var focusRecMargin = 0;
                    var focusTime = parseInt(self.xScale.invert(self.mouseX));
                    var focusStr = moment.utc(focusTime).format('d MMM YY, h:mm:ss A');
                    var rectWidth = ( focusStr.length * 9) + 5;

                    if (self.mouseX + rectWidth + 10 > self.data.width - self.data.margin.right) {
                        focusRecMargin = rectWidth + 15;
                    }

                    var trasnX = self.mouseX - focusRecMargin + 8;
                    if(trasnX < 10 + self.data.margin.left){
                        trasnX = 10 + self.data.margin.left;
                    }

                    self.timePopRight
                        .attr("transform", "translate(" + trasnX + "," + 30 + ")")
                        .select("text").text(focusStr);
                    self.timePopRight
                        .select("rect")
                        .attr("width", rectWidth)
                }
            }

            function zoomGraphMouseEvent() {
                if(vm.tcGraphs.mouseclicked) {
                    vm.tcGraphs.mouseclicked = false;
                    vm.tcGraphs.zoomEnd = parseInt(self.xScale.invert(self.mouseX));
                    if (Math.abs(vm.tcGraphs.zoomEnd - vm.tcGraphs.zoomStart) > 1000 * 60 * 2) {
                        if (vm.tcGraphs.zoomEnd < vm.tcGraphs.zoomStart) {
                            var tempStartZoon = vm.tcGraphs.zoomStart;
                            vm.tcGraphs.zoomStart = vm.tcGraphs.zoomEnd;
                            vm.tcGraphs.zoomEnd = tempStartZoon;
                        }
                        vm.tcGraphs.zoom();
                    }
                    self.selectRect
                        .attr('y',-1000)
                    self.timePopRight
                        .attr("transform", "translate(0,-1000)")
                }
            }

            self.updateLine = function (x, chart) {
                if(!self.xScale)
                    return;
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

            self.draw = function(graphs) {
                if(graphs) self.data.graph = graphs;
                getAxisScale();
                draw();
            }

            self.redraw = function () {
                draw();
            }

            function draw() {
                d3.selectAll(self.data.svg+" > *").remove();

                self.clipRect = self.visP.append("clipPath")    // define a clip path
                    .attr('x',0)
                    .attr('y',0)
                    .attr("id", "main-clip"+self.data.svg) // give the clipPath an ID
                    .append("rect")
                    .attr("x", self.data.margin.left)
                    .attr("y", self.data.margin.top)
                    .attr("width", self.data.width - self.data.margin.left - self.data.margin.right)
                    .attr("height", self.data.height)

                self.vis = self.visP
                    .append("svg:g")
                    .attr('class', 'visTrans')
                    .attr("clip-path", "url(#main-clip"+self.data.svg+")") // clip the rectangle
                    .attr("transform", "translate(0,0) ");

                self.visAxis = self.visP
                    .append("svg:g")
                    .attr('class', 'visTrans')
                    .attr("transform", "translate(0,0) ");

                self.xAxis = d3.axisBottom()
                    .scale(self.xScale)
                    .ticks(5)
                    .tickFormat(function(d) {
                        return d3.timeFormat('%H:%M')(new Date(d))
                    })

                self.y1Axis = d3.axisLeft()
                    .scale(self.y1Scale)
                    .ticks(6)

                self.y2Axis = d3.axisRight()
                    .scale(self.y2Scale)
                    .ticks(6)

                self.visAxis.append("svg:g")
                    // .attr("class", "axis")
                    .attr("transform", "translate(0," + (self.data.height - self.data.margin.bottom) + ")")
                    .attr('font-size','80%')
                    .attr('font-family','gotham')
                    .attr('shape-rendering','crispEdges')
                    .call(self.xAxis)

                if(!self.chart.data.parent){
                    self.visAxis.append("svg:g")
                        // .attr("class", "axis")
                        .attr('font-size','80%')
                        .attr('font-family','gotham')
                        .attr('shape-rendering','crispEdges')
                        .attr("transform", "translate(" + (self.data.margin.left) + ",0)")
                        .call(self.y1Axis);

                    self.visAxis.append("svg:g")
                        // .attr("class", "axis")
                        .attr('font-size','80%')
                        .attr('font-family','gotham')
                        .attr('shape-rendering','crispEdges')
                        .attr("transform", "translate(" + (self.data.width - self.data.margin.right) + ",0)")
                        .call(self.y2Axis);
                }

                self.lineGenY1 = d3.line().x(function (d) {
                    return self.xScale(d.x);
                }).y(function (d) {
                    return self.y1Scale(d.y);
                });
                self.lineGenY2 = d3.line().x(function (d) {
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


                for(var idx in self.data.barCharts){
                    for(jdx in self.data.barCharts[idx].values){
                        var startTime = vm.traceControls.timeline[self.data.barCharts[idx].values[jdx].x1].gpstime
                        var endTime = vm.traceControls.timeline[self.data.barCharts[idx].values[jdx].x2].gpstime;
                        var rectX = self.xScale(startTime);
                        var rectWidth = self.xScale(endTime) - rectX ;
                        self.vis.append("rect")
                            .attr("x", rectX)
                            .attr("width", rectWidth)
                            .attr("height", 5)
                            .attr("clip-path", "url(#main-clip"+self.data.svg+")") // clip the rectangle
                            .attr('fill', self.data.barCharts[idx].color)
                            .attr("y", 2 + (idx * 7));
                    }
                }


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
                    if(!self.data.parent) {
                        self.nameText[idx] = self.vis.append("text")
                            .attr("x", self.data.margin.left + 10)
                            .attr('fill', self.chart.graphs[idx].color)
                            .attr('font-size','70%')
                            .attr('font-family','gotham')
                            // .attr('class', 'nameText')
                            .attr("y", self.data.margin.top + 10 + (idx * 15))
                            .text(self.chart.graphs[idx].key);
                    }
                    self.focusText[idx] = self.vis.append("g")
                    self.focusText[idx].append("rect")
                        .attr("width", 10)
                        .attr("height", 16)
                        .attr('opacity', '0.9')
                        .attr('fill', '#f5f5f5')
                        .attr('stroke-width', 1)
                        .attr('stroke', '#ccc')
                        .attr('font-family','gotham')
                        // .attr('class', 'focusRect')
                        .attr("y", -8 + (idx * 20));

                    self.focusText[idx].append("text")
                        .attr("x", 4)
                        .attr('fill', self.chart.graphs[idx].color)
                        .attr('font-size','70%')
                        .attr('font-family','gotham')
                        // .attr('class', 'focusText')
                        .attr("y", 4 + (idx * 20));
                }
                self.focusLine = self.vis.append("line")
                    // .attr('class', 'focus-line')
                    .attr('stroke', '#000')
                    .attr('opacity', 0.5)
                    .attr("x1", -1000)
                    .attr("x2", -1000)
                    .attr("y1", self.data.margin.top)
                    .attr("y2", (self.data.height - self.data.margin.top))
                    .attr("stroke-width", 1)
                    .attr("stroke", "#ccc");


                self.selectRect = self.vis.append('rect')
                    .attr('x', vm.tcGraphs.zoomStartX)
                    .attr('y', -1000)
                    .attr('width', 0)
                    .attr('fill', 'rgba(255,0,0,0.2)')
                    .attr('height', self.data.height - self.data.margin.top - self.data.margin.bottom)


                self.timePopRight = self.vis.append("g")
                    .attr("transform", "translate(0,-1000)")
                self.timePopRight.append("rect")
                    .attr("width", 10)
                    .attr("height", 22)
                    .attr('fill', '#f5f5f5')
                    .attr('stroke-width', 1)
                    .attr('stroke', '#ccc')
                    .attr('font-size','70%')
                    .attr('font-family','gotham')
                    // .attr('class', 'focusRect')
                    .attr("y", 10);
                self.timePopRight.append("text")
                    .attr("x", 8)
                    .attr('fill', '#444')
                    .attr('font-size','120%')
                    .attr('font-family','gotham')
                    // .attr('class', 'popText')
                    .attr("y", 28);



                self.vis.append("rect")
                    .attr("x", self.data.margin.left)
                    .attr("y", self.data.margin.top)
                    .attr("fill", 'transparent')
                    .attr("width", self.data.width - self.data.margin.left - self.data.margin.right)
                    .attr("height", self.data.height -  self.data.margin.top -  self.data.margin.bottom - 1 )
                    .on("mouseleave", function () {
                        zoomGraphMouseEvent()
                    })


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

                self.xScale = d3.scaleLinear().range([self.data.margin.left, self.data.width - self.data.margin.right]).domain([new Date(self.axisScale.xl), new Date(self.axisScale.xh)]);
                self.y1Scale = d3.scaleLinear().range([self.data.height - self.data.margin.top, self.data.margin.bottom]).domain([self.axisScale.y1.yl, self.axisScale.y1.yh]);
                self.y2Scale = d3.scaleLinear().range([self.data.height - self.data.margin.top, self.data.margin.bottom]).domain([self.axisScale.y2.yl, self.axisScale.y2.yh]);

                // self.xScale.ticks(5);
                //     tickFormat = self.xScale.tickFormat(5, "+%");
                //
                // ticks.map(tickFormat); // ["-100%", "-50%", "+0%", "+50%", "+100%"]
            }

        }


        vm.init = function () {
            loadMap();
            getTimelineObjects();
            createExpandedGraph();
            $scope.$on('gotHistoryEvent', vm.gotHistoryEvent);
            $scope.$on('gotHistoryEventFailed', vm.gotHistoryEventFailed);

            vm.gotHistory = historyService.getData('getHistory');
            var tempSelectedvehicles = $scope.getMatches(mapService.filterStr);
            if(tempSelectedvehicles.length > 0){
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


            setMapHeight();

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
        dialogService.setTab(1);

        var dateFormat = 'DD-MM-YYYY HH:mm';
        var historyData = [];
        var tableContainer = document.getElementById('geo-table');
        var table, data;

        vm.jsonHistoryData = [];
        vm.historyMap = historyService.historyMap;
        vm.multiSelect = vm.historyMap.multiSelect;
        vm.disableDownload = true;
        vm.showLoading = false;
        vm.convertLatLngToAddr = true;

        $scope.getHistory = function () {
            historyService.setData('getHistory', false);
            historyData = [];
            vm.jsonHistoryData = [];
            vm.disableDownload = true;
            vm.showLoading = true;
            if (table)
                table.clearChart(tableContainer);
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


            // data.setProperty(0, 0, 'style', 'width:150px');
            // data.setProperty(0, 1, 'style', 'width:150px');
            // data.setProperty(0, 2, 'style', 'width:150px');
            // data.setProperty(0, 3, 'style', 'width:150px');
            // data.setProperty(0, 4, 'style', 'width:250px');

            table.draw(data, {
                showRowNumber: true,
                page: 'enable',
                width:'100%',
                height:'100%',
                pageSize: 300,
                allowHtml: true,
                alternatingRowStyle:true
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
