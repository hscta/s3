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

        //requestService.isLoginTokenValid();

        vm.isLoginTokenValid = function() {
            //$log.log("isLoginTokenVaild");
            $interval(intellicarAPI.requestService.isLoginTokenValid, 5000);
        }

        vm.isLoginTokenValid();
    }

})();
