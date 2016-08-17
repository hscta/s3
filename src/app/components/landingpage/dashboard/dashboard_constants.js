/**
 * Created by smiddela on 17/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .factory('dashboardConstants', dashboardConstants);

    function dashboardConstants() {
        var STATE_HOME = "home";
        var STATE_HOME_DASHBOARD = "home.dashboard";

        return {
            STATE_HOME : STATE_HOME,
            STATE_HOME_DASHBOARD : STATE_HOME_DASHBOARD
        }
    }

})();
