
(function(){


    angular
        .module('uiplatform')
        .controller('DialogController', DialogController);

    function DialogController($scope, $rootScope, $log, mapService,
                              $timeout, $mdDialog, $document, $interval, $state,
                              rightNavAlertDashboardService,MapLeftToolBarService, historyService) {

        var vm = this;
        $log.log("DialogController");


        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $log.log($state);

        $scope.$watch('selectedTab', function(current, old) {
            switch (current) {
                case 0:
                    $location.url("/#/history");
                    break;
                case 1:
                    $location.url("/#/geofencing");
                    break; 
            }
        });

    }

})();

/**
 * Created by User on 24-09-2016.
 */
