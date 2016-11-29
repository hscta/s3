/**
 * Created by Rinas Musthafa on 11/27/2016.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('History2Controller', History2Controller)

    function History2Controller($scope, $log, $mdDialog, dialogService,$window,
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

        vm.traceControls = {
            interval:30000, // 30 seconds
            timeline:[],
            playing:false,
            SPEEDS:[600,400,200,100,50],
            speed:1, // normal
            current:0,
            togglePlay:function () {
                isPointer();
                if(vm.traceControls.playing){
                    stopMotion();
                }else{
                    setPointerTransition(true);
                    startMotion()
                }
            },
            stepForward:function () {
                if(vm.traceControls.current < vm.traceControls.timeline.length-1){
                    vm.traceControls.current++;
                    setPointerTransition(false);
                    moveTimeline();
                }
            },
            stepBackward:function () {
                if(vm.traceControls.current > 0){
                    vm.traceControls.current--;
                    setPointerTransition(false);
                    moveTimeline();
                }
            },
            incrementSpeed:function () {
                if(vm.traceControls.speed < vm.traceControls.SPEEDS.length-1){
                    vm.traceControls.speed++;
                    if(vm.traceControls.playing){
                        startMotion();
                    }
                    setPointerTransition(true);
                }
            },
            decrementSpeed:function () {
                if(vm.traceControls.speed > 0){
                    vm.traceControls.speed--;
                    if(vm.traceControls.playing){
                        startMotion();
                    }
                    setPointerTransition(true);
                }
            },
            engine:{},
        }

        function jumpToTime(time) {
            if(vm.traceControls.current + time < 0){
                vm.traceControls.current = 0;
                moveTimeline();
            } else if(vm.traceControls.current + time > vm.traceControls.timeline.length){
                vm.traceControls.current = vm.traceControls.timeline.length-1;
                moveTimeline();
            }else{
                vm.traceControls.current += time;
                moveTimeline();
            }
        }

        getTimelineObjects();

        vm.gotHistoryEvent = function (event, data) {
            generateTimeline(data.path);
            drawTimeline();
        }

        function setPointerTransition(bool) {
            if(bool){
                vm.traceControls.pointer.css('transition', vm.traceControls.SPEEDS[vm.traceControls.speed] + 'ms linear');
            }else{
                vm.traceControls.pointer.css('transition', 0 + 'ms linear');
            }
        }

        function isPointer() {
            if(!vm.traceControls.pointer){
                vm.traceControls.pointer = $('.tc_pointer');
            }
            setPointerTransition(true);
        }

        function stopMotion() {
            if(vm.traceControls.playing){
                vm.traceControls.playing = false;
                $interval.cancel(vm.traceControls.engine);
            }
        }

        function startMotion() {
            if(vm.traceControls.timeline.length > 0 && vm.traceControls.current < vm.traceControls.timeline.length){
                vm.traceControls.panel.clicked = false;
                vm.traceControls.playing = true;
                if(vm.traceControls.engine){
                    $interval.cancel(vm.traceControls.engine);
                }
                vm.traceControls.current++;
                moveTimeline();
                vm.traceControls.engine = $interval(function () {
                    if(vm.traceControls.current >= vm.traceControls.timeline.length){
                        $interval.cancel(vm.traceControls.engine);
                        vm.traceControls.playing = false;
                        vm.traceControls.current = -1;
                    }
                    vm.traceControls.current++;
                    moveTimeline();
                },vm.traceControls.SPEEDS[vm.traceControls.speed]);
            }
        }

        function moveTimeline() {
            var left = vm.traceControls.current / vm.traceControls.timeline.length * 100;
            vm.traceControls.pointer.css({'left':left+'%'});
            vm.historyMap.startMarker.setPosition(vm.traceControls.timeline[vm.traceControls.current]);
        };

        function mouseMoveEvent(event) {
            var start = vm.traceControls.timeline.length;
            var width = vm.traceControls.panel.element.width()
            var position = vm.traceControls.panel.element.offset().left;
            if(position < 0)
                position = 0;
            vm.traceControls.current = parseInt( (event.pageX - position) * start / width)+1;
            if(vm.traceControls.current >= vm.traceControls.timeline.length)
                vm.traceControls.current = vm.traceControls.timeline.length - 1;
            moveTimeline();
        }

        var speedThreshold = 3;
        var graphBase = 0;
        var barHeight = 7;
        var barMargin = 1;
        var barBase = 0;
        var c = null;
        var ctx;
        // c.className = 'myCanvas';
        var cw;
        var ch;
        var wr;

        function drawTimeline() {
            // creating canvas
            if(c != null){
                c.remove();
            }
            c = document.createElement('canvas');
            ctx = c.getContext("2d");
            // c.className = 'myCanvas';
            cw = vm.traceControls.panel.element.width();
            ch = vm.traceControls.panel.element.height();
            wr = vm.traceControls.panel.element.width() /  vm.traceControls.timeline.length ;
            c.height = ch;
            c.width = cw;
            vm.traceControls.panel.element.append(c);



            ctx.fillStyle = '#f00';
            ctx.fillRect(0, 0, vm.traceControls.timeline.length * wr, ch);
            ctx.fill();
            // drawing things
            ctx.clearRect(0, 0, vm.traceControls.timeline.length * wr, ch);
            var pre_ignstatus = false;
            var pre_moving = false;
            var ign_rect = {};
            var moving_rect = {};
            var highestSpeed = 0;
            ctx.strokeStyle = 'rgba(0,0,0, 0.04)';
            for(var idx in vm.traceControls.timeline){
                if(idx % 10 == 0){
                    ctx.moveTo(idx * wr, 0);
                    ctx.lineTo(idx * wr, ch);
                }
            }
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0,0,0, 0.1)';
            for(var idx=1; idx < 4; idx++){
                ctx.moveTo(0,  idx * ch/4);
                ctx.lineTo(cw, idx * ch/4);
            }
            ctx.stroke();
            for(var idx in vm.traceControls.timeline){
                var speed = vm.traceControls.timeline[idx].speed;
                if(highestSpeed < speed)
                    highestSpeed = speed;
                var ignition = vm.traceControls.timeline[idx].ignstatus;
                var moving = false;
                if(vm.traceControls.timeline[idx].speed > speedThreshold){
                    moving = true;
                }
                if(ignition && !pre_ignstatus){
                    ign_rect.x = idx ;
                }else if(pre_ignstatus){
                    ign_rect.w = idx - ign_rect.x ;
                    ctx.fillStyle = '#9DAAFF';
                    ctx.fillRect(ign_rect.x * wr, barBase, ign_rect.w * wr, barHeight);
                    ctx.fill();
                }
                if(moving && !pre_moving){
                    moving_rect.x = idx ;
                }else if(pre_moving){
                    moving_rect.w = idx -  moving_rect.x ;
                    ctx.fillStyle = '#63DB5D';
                    ctx.fillRect(moving_rect.x * wr, barBase+((barHeight + barMargin) ), moving_rect.w * wr, barHeight);
                    ctx.fill();
                }
                pre_ignstatus = ignition;
                pre_moving = moving;
                ctx.fill();
            }
            highestSpeed += 20 + graphBase;
            ctx.beginPath();
            ctx.moveTo(0, ch-graphBase);
            ctx.strokeStyle = 'rgba(255, 69, 0, 0.77)';
            ctx.fillStyle = 'rgba(255, 69, 0, 0.2)';
            for(var idx in vm.traceControls.timeline){
                if(vm.traceControls.timeline[idx].speed < speedThreshold)
                    vm.traceControls.timeline[idx].speed = 0;
                var speed = vm.traceControls.timeline[idx].speed / highestSpeed * ch ;
                ctx.lineTo(idx * wr, ch - speed - graphBase);
            };

            ctx.lineTo(0, ch-graphBase);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }

        function generateTimeline(path) {
            var timeline = [];
            var first = path[0];
            var last = path[path.length-1];
            var currentTime = first.gpstime;
            var currentPathIdx = 0;

            while(currentTime < last.gpstime){
                if(path[currentPathIdx].gpstime < currentTime){
                    currentPathIdx++;
                    path[currentPathIdx].gpstime = currentTime;
                    timeline.push(path[currentPathIdx]);
                }else{
                    timeline.push(path[currentPathIdx]);
                }
                currentTime+= vm.traceControls.interval;
            }
            vm.traceControls.timeline = timeline;
        }
        
        function getTimelineObjects() {
            vm.traceControls.pointer = $('.tc_pointer');
            vm.traceControls.panel = {
                clicked:true,
            };
            vm.traceControls.panel.element = $('.tc_panel');
            vm.traceControls.panel.element.mousedown(function (event) {
                console.log('im mouse down');
                if(!vm.traceControls.playing){
                    if(!vm.traceControls.panel.clicked){
                        vm.traceControls.panel.clicked = true;
                    }else{
                        vm.traceControls.panel.clicked = false;
                    }
                }

                vm.traceControls.pointer.css('transition', 0 + 'ms linear');
                mouseMoveEvent(event);
            });
            $($window).mouseup(function () {
                // vm.traceControls.panel.clicked = false;
                // vm.traceControls.pointer.css('transition', vm.traceControls.SPEEDS[vm.traceControls.speed] + 'ms linear');
            });
            vm.traceControls.panel.element.mousemove(function (event) {
                if(vm.traceControls.panel.clicked){
                    setPointerTransition(false);
                    mouseMoveEvent(event);
                }
            });

            $($window).keyup(function () {
                setPointerTransition(true);
            });
            $($window).keydown(function (event) {
                console.log('im down');
                setPointerTransition(false);
                if(!vm.traceControls.playing && vm.traceControls.panel.clicked){
                    if(event.keyCode == 37){ // left
                        jumpToTime(-1);
                    }else if(event.keyCode == 38){ // up
                        jumpToTime(10);
                    }else if(event.keyCode == 39){ // right
                        jumpToTime(1);
                    }else if(event.keyCode == 40){ // down
                        jumpToTime(-10);
                    }
                }
            });
        }

        vm.getCurrentPos = function () {
            return vm.traceControls.timeline[vm.traceControls.current];
        }


        vm.init = function () {
            loadMap();
            setDefaultVehicle();
            // history2Service.addListener('gotHistory', vm.gotHistory);
            $scope.$on('gotHistoryEvent', vm.gotHistoryEvent)
        };
        vm.init();
    }

})();
