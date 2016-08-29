/**
 * Created by harshas on 26/8/16.
 */

(function() {

    angular
        .module('uiplatform')
        .directive('icarPanelExpansion', icarPanelExpansion)

    function icarPanelExpansion($log, $mdDialog, $mdExpansionPanel) {
        return{
            restrict : 'E',
            templateUrl : 'app/components/common_directives/panel-expansion.html',
            //replace: false,
            //transclude: true,
            scope: {
                details: '='
            },
            link: function (scope, $mdMedia) {
                scope.readMode = true;
                scope.deleted_panel_id;
                scope.master = {};

                scope.save = function(){
                   $log.log('saveeeeeeeeeeeeeeeeeeee');
               };

               scope.discard = function($panel) {
                   scope.readMode = true;
                   scope.details = angular.copy(scope.master);
                   $panel.collapse();
               }

               scope.edit = function(){
                   if ( scope.readMode )
                       scope.readMode = false;
                   $log.log('edittttttttttttttttttttt');
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

               scope.delete_selected = function () {
                   $mdExpansionPanel().waitFor(scope.deleted_panel_id).then(function (instance) {
                       instance.remove();
                   });
                   $mdDialog.cancel();
               };

               scope.cancel_selected = function () {
                   $mdDialog.cancel();
                   $log.log('my delete');
               };

               scope.get_current_data = function () {
                   scope.master = {};
                   scope.master = angular.copy(scope.details);
               };
            }
        }
    }
})();

