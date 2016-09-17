/**
 * Created by smiddela on 15/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('LeftNavDashboardController', LeftNavDashboardController);

    function LeftNavDashboardController($log, leftNavAlertDashboardService) {
        var vm = this;
        vm.alertDetails = [];
        vm.getDashboardAlerts = function (data) {
            $log.log(data);
            vm.formatAlertData(data);

            $log.log(vm.alertDetails);
        };

        var count = 0;
        vm.formatAlertData = function (data){
            var details = {};
            for ( var i = 0; i < data.length; i++ ) {
                details = {};
                details.name = data[i].info.name;
                details.assetpath = data[i].info.assetpath;
                details.id = count++;
                vm.alertDetails.push(details);

                if ( data[i].items.length )
                    vm.formatAlertData(data[i].items)
            }
        };

        vm.getDashboardAlertsFailure = function (data) {
            $log.log("getDashboardTreeFailure");
            $log.log(data);
        };


        vm.initialize = function () {
            leftNavAlertDashboardService.getDashboardAlerts({})
                .then(vm.getDashboardAlerts, vm.getDashboardAlertsFailure);
        };


        vm.alertResolve = function (alertId){
            $log.log(alertId);
            for ( var i = 0; i < vm.alertDetails.length; i++ ) {
                if ( alertId == vm.alertDetails[i].id ){
                    $log.log('matched');
                    vm.alertDetails.splice(i,1);
                    return;
                }
            }
        };

        vm.initialize();
    }
})();
