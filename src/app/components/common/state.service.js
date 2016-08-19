/**
 * Created by smiddela on 17/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .factory('stateService', stateService);

    function stateService() {
        var STATE_HOME = "home";
        var STATE_HOME_DASHBOARD = "home.dashboard";
        var STATE_HOME_MANAGEMENT = "home.management"

        return {
            STATE_HOME : STATE_HOME,
            STATE_HOME_DASHBOARD : STATE_HOME_DASHBOARD,
            STATE_HOME_MANAGEMENT : STATE_HOME_MANAGEMENT
        }
    }

})();
