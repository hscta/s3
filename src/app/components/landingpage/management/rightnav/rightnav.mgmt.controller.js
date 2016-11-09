/**
 * Created by smiddela on 05/11/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('RightNavMgmtController', RightNavMgmtController);

    function RightNavMgmtController($log, $scope, $timeout, rightNavMgmtService, intellicarAPI, $q) {
        $log.log("RightNavMgmtController");
        var vm = this;

        vm.init = function () {

        };

        
        vm.toggleRightSidebar = function(event, data) {
            $log.log('dashboard right nav ')
            if ( data.right_nav_toggle) {
                document.getElementById("mySidenav").style.width = "320px";
                document.getElementById("main").style.marginRight = "320px";
            } else{
                document.getElementById("mySidenav").style.width = "0";
                document.getElementById("main").style.marginRight= "0";
            }
        };

        $scope.$on('toggleRightSidebar', vm.toggleRightSidebar);


        vm.init();
    }
})();
