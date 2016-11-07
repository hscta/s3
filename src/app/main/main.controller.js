(function(){


    angular
        .module('uiplatform')
        .controller('MainController', MainController);

    function MainController($scope, $rootScope, $log, intellicarAPI) {

        $log.log('MainController');
        var vm = this;
        vm.dummy = false;

        vm.toggleLeftnav = function(event, data) {
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftSidebar', vm.toggleLeftSidebar);


        //To periodically check if the token is valid
        // vm.isLoginTokenValid = function() {
        //     //$log.log("isLoginTokenVaild");
        //     $interval(intellicarAPI.requestService.isLoginTokenValid, 5000);
        // }
        //
        // vm.isLoginTokenValid();
    }



    /*
     *  Jquery code for fixing resolution problem of map
     *
     * */

    // var headerAutoHide = false;
 

    // var headerYVal = 80;
    // var wh = $(window).height();

    // $(document).mousemove(function(event){
    //     if(headerAutoHide) {
    //         if (event.pageY < headerYVal) {
    //             // showHeader();
    //             headerYVal = 150;
    //         } else {
    //             hideHeader();
    //             headerYVal = 80;
    //         }
    //     }
    // });

    // function hideHeader() {
    //     $('.mainHeader').css({'margin-top':'-45px'});
    // }

    // function showHeader() {
    //     $('.mainHeader').css({'margin-top':'0'});
    // }

})();
