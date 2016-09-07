/**
 * Created by harshas on 26/8/16.
 */

(function() {

    angular
        .module('uiplatform')
        .directive('icarPanelExpansion', icarPanelExpansion)

        function icarPanelExpansion($log, $mdDialog, $mdExpansionPanel, $mdExpansionPanelGroup,
                                $stateParams) {
        return{
            restrict : 'ACE',
            templateUrl : 'app/components/common/directives/panel-expansion.html',
            trasclude:true,
            scope: {
                details: '='
            },
            link: function (scope) {
                var type = $stateParams.type;
                scope.templateType = 'app/components/landingpage/management/settings/'+type+'/'+type+'Details.html';
                scope.slides = [
                    {
                        image: 'assets/images/car1.jpg'
                    },
                    {
                        image: 'assets/images/car2.jpg'
                    },
                    {
                        image: 'assets/images/car3.jpg'
                    },
                    {
                        image: 'assets/images/car4.jpg'
                    }
                ];

                scope.deleted_panel_id;
                scope.master = {};

                scope.save = function(){
                   $log.log('saveeeeeeeeeeeeeeeeeeee');
               };

               scope.discard = function(panelId) {
                   scope.readMode = true;
                   scope.details = angular.copy(scope.master);
                  // scope.collapsePanel(panelId);
               }

               scope.edit = function(){
                   if ( scope.readMode )
                       scope.readMode = false;
               };

               scope.delete = function(ev) {
                   $log.log('deleteeeeeeeeeeeeeeeee');
                   var options = {
                       templateUrl: '/app/components/common_directives/panel_delete_dialog.html',
                       scope: scope,
                       preserveScope: true,
                   };

                   scope.deleted_panel_id = ev.toString();
                   $mdDialog.show(options);
               };

               scope.deleteSelected = function () {
                   $mdExpansionPanel().waitFor(scope.deleted_panel_id).then(function (instance) {
                       instance.remove();
                   });
                   $mdDialog.cancel();
               };

               scope.cancelSelected = function () {
                   $mdDialog.cancel();
                   $log.log('my delete');
               };

               scope.getCurrentData = function () {
                   scope.master = {};
                   scope.master = angular.copy(scope.details);
               };

               scope.collapsePanel = function(panelId) {
                   $log.log(panelId);
                   panelId = panelId.toString();
                   $mdExpansionPanel(panelId).collapse();
                   scope.readMode = true;
               };

               scope.panelCount = $mdExpansionPanelGroup('panelGroup').count() + 1;

                $log.log(scope.panelCount);

            }
        }
    }
})();

