/**
 * Created by smiddela on 06/09/16.
 */


(function () {

    angular
        .module('uiplatform')
        .directive('icarExpanel', icarExpanel);

    function icarExpanel($log, $mdDialog, $mdExpansionPanel, $mdExpansionPanelGroup) {

        return {
            restrict: 'ACE',
            templateUrl: 'app/components/common/directives/icar-expanel.html',
            scope: {
                details: '=',
                schema: '='
            },

            link: function (scope) {
                scope.contentTemplate = "panel-content.html";
                scope.headerTemplate = "panel-header.html";
                scope.footerTemplate = "panel-footer.html";
                //scope.collapseStatus = true;
                scope.confirmDialog = $mdDialog.confirm()
                    .title('Delete asset ?')
                    .clickOutsideToClose(true)
                    .ok('Yes')
                    .cancel('No');

                //$log.log("icarExpanel directive loaded");

                scope.discard = function () {
                };

                scope.edit = function () {
                };

                scope.delete = function () {
                    $mdDialog.show(scope.confirmDialog)
                        .then(function () {
                            $log.log("OK");
                        }, function () {
                            $log.log("Cancel");
                        });
                };

                scope.deleteSelected = function () {
                };

                scope.cancelSelected = function () {
                };

                scope.expandCollapse = function (panel) {
                    //scope.collapseStatus = !scope.collapseStatus;
                    //$log.log("collapseClick " + scope.collapseStatus);
                    if (panel.isOpen())
                        panel.collapse();
                    else
                        panel.expand();
                };

                scope.collapsePanel = function () {
                };
            }
        }
    }
})();

