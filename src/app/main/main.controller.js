(function(){


    angular
        .module('uiplatform')
        .controller('MainController', MainController);

    function MainController( $scope, $rootScope, $interval, $mdSidenav, $mdBottomSheet, $log, $q, $state,
                            $mdToast, $document, loginService, requestService, loginService, navService) {

        $log.log('MainController');
        var vm = this;
        vm.dummy = false;

        vm.toggleLeftnav = function(event, data) {
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftnav', vm.toggleLeftnav);

        //requestService.isLoginTokenValid();

        vm.isLoginTokenValid = function() {
            //$log.log("isLoginTokenVaild");
            $interval(requestService.isLoginTokenValid, 5000);
        }

        vm.isLoginTokenValid();
    }

})();
