
(function () {
    'use strict';

    angular.module('uiplatform')
        .service('dialogService', dialogService);

    function dialogService($log,$state,$cookies) {
        $log.log("dialogService");
        var vm = this;
        vm.dialogShow = false;

        var dialogStates = ['home.geofence','home.history'];
        var testObject = {'myName':{'yo1':'yoyo'}};
        // $cookies.put('hell',JSON.stringify(testObject));

        // console.log(JSON.parse($cookies.get('hell')));

        vm.getData = function (key) {
            return vm[key];
        };

        vm.setData = function (data, key) {
            vm[key] = data;
        };

        var selectedTab = 0;

        vm.show = function(state,params){
            vm.setData(params,'historyData');
            $state.go(state,params);
            fadeInDialog();
        };

        vm.hide = function(){
            $state.go('home');
            vm.dialogShow = false;
            $('.int-dialog').fadeOut(300);
        };

        function fadeInDialog() {
            $('.int-dialog').fadeIn(300);
            vm.dialogShow = true;
        };


        vm.getTab = function(){
            // console.log($state.current.name);
            // if($state.current.name == 'home.history'){
            //     selectedTab = 0;
            // }else if($state.current.name == 'home.geofence'){
            //     selectedTab = 1;
            // }
            return selectedTab;
        };

        vm.getDialogShow = function () {
            return vm.dialogShow;
        };

        vm.setDialogShow = function (val) {
            vm.dialogShow = val;
        };



        vm.setTab = function(state) {
            vm.setTabListener(state);
        };

        vm.addSetTabListener = function(listener) {
            vm.setTabListener = listener;
        };

        vm.init = function () {

            for(var i=0; i < dialogStates.length; i++){
                if($state.current.name == dialogStates[i]) {
                    fadeInDialog();
                }
            }
        };

        vm.init();

    }

})();
/**
 * Created by User on 22-09-2016.
 */
