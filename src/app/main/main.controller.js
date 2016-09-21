(function(){


    angular
        .module('uiplatform')
        .controller('MainController', MainController);

    function MainController($scope, $rootScope, $log, intellicarAPI, $interval) {

        $log.log('MainController');
        var vm = this;
        vm.dummy = false;

        vm.toggleLeftnav = function(event, data) {
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftnav', vm.toggleLeftnav);


        //To periodically check if the token is valid
        // vm.isLoginTokenValid = function() {
        //     //$log.log("isLoginTokenVaild");
        //     $interval(intellicarAPI.requestService.isLoginTokenValid, 5000);
        // }
        //
        // vm.isLoginTokenValid();
    }

    var headerYVal = 80;
    var wh = $(window).height();

    $(document).mousemove(function(event){
        if(event.pageY < headerYVal){
            showHeader();
            headerYVal = 150;
        }else{
            hideHeader();
            headerYVal = 80;
        }
    });

    function hideHeader() {
        $('.mainHeader').css({'margin-top':'-45px'});
        $('.angular-google-map-container').css('height', (wh - 50) + 'px');
    }

    function showHeader() {
        $('.mainHeader').css({'margin-top':'0'});
        $('.angular-google-map-container').css('height', (wh - 95) + 'px');
    }

})();
