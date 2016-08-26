/**
 * Created by harshas on 26/8/16.
 */

(function() {

    angular
        .module('uiplatform')
        .directive('icarPanelExpansion', icarPanelExpansion)

    function icarPanelExpansion() {
            return{
                restrict : 'E',
                templateUrl : 'app/components/common_directives/panel-expansion.html',
                scope: {
                    details: '='
                },
            }
    }
})();

