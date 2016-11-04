(function () {
    'use strict';

    angular.module('uiplatform')
        .service('dialogService', dialogService)
        .service('cpuService', cpuService);

    function dialogService($log, $state, $cookies) {
        $log.log("dialogService");
        var vm = this;
        vm.dialogShow = false;

        var dialogStates = ['home.geofence', 'home.history', 'home.alarm'];
        // var testObject = {'myName':{'yo1':'yoyo'}};
        // $cookies.put('hell',JSON.stringify(testObject));

        // console.log(JSON.parse($cookies.get('hell')));

        vm.getData = function (key) {
            return vm[key];
        };

        vm.setData = function (data, key) {
            vm[key] = data;
        };


        vm.show = function (state, params) {
            // vm.setData(params,'historyData');
            $state.go(state, {"mapObj": params});
            fadeInDialog();
        };


        vm.hide = function () {
            $state.go('home');
            vm.dialogShow = false;
            $('.int-dialog').fadeOut(300);
        };


        function fadeInDialog() {
            $('.int-dialog').fadeIn(300);
            vm.dialogShow = true;
        };


        vm.getTab = function () {
            var selectedTab;
            // console.log($state.current.name);
            if ($state.current.name == 'home.history') {
                selectedTab = 0;
            } else if ($state.current.name == 'home.geofence') {
                selectedTab = 1;
            }
            return selectedTab;
        };

        vm.getDialogShow = function () {
            return vm.dialogShow;
        };

        vm.setDialogShow = function (val) {
            vm.dialogShow = val;
        };


        vm.setTab = function (state) {
            vm.setTabListener(state);
        };

        vm.addSetTabListener = function (listener) {
            vm.setTabListener = listener;
        };

        vm.init = function () {

            for (var i = 0; i < dialogStates.length; i++) {
                if ($state.current.name == dialogStates[i]) {
                    fadeInDialog();
                }
            }
        };

        vm.init();

    }


    function cpuService() {
        
        var vm = this;

        vm.tracking = true;

        vm.trackArray = [];

        vm.track = function (id) {
            if(vm.tracking){
                if(id in vm.trackArray){
                    if(vm.trackArray[id].end_time == 0){
                        // if the tracking is not ended
                        vm.trackArray[id].end_time = getCurrentCpuTime(); 
                        vm.trackArray[id].diff = vm.trackArray[id].end_time - vm.trackArray[id].start_time ;
                    }else{
                        vm.trackArray[id] = getNewTrackObject(id);
                    }
                }else{
                    vm.trackArray[id] = getNewTrackObject(id);
                }
            }
            // console.log(vm.trackArray);
        }

        function getNewTrackObject(id) {
            return {
                id : id,
                count: 0,
                start_time: getCurrentCpuTime(),
                end_time: 0,
            }
        }

        function getCurrentCpuTime() {
            return performance.now();
        }

    }

})();
/**
 * Created by User on 22-09-2016.
 */
