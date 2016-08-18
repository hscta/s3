(function(){


    angular
        .module('uiplatform')
        .controller('MainController', MainController);

    function MainController( $scope,$rootScope, navService, $mdSidenav, $mdBottomSheet, $log, $q, $state,
                            $mdToast, $document, loginService, requestService) {

        $log.log('MainController');
        var vm = this;
        vm.dummy = false;

        vm.toggleLeftnav = function(event, data) {
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftnav', vm.toggleLeftnav);

    }

})();
