/**
 * Created by harshas on 26/8/16.
 */

(function() {

    angular
        .module('uiplatform')
        .directive('icarPanelExpansion', icarPanelExpansion)

    function icarPanelExpansion($log, $mdDialog, $mdExpansionPanel, $mdExpansionPanelGroup,
                                $stateParams, $compile) {
        return{
            restrict : 'E',
            templateUrl : 'app/components/common/directives/panel-expansion.html',
            trasclude:true,
            scope: {
                details: '=',
                myFunc: '&clickPanel',
                fields : '='
            },
            link: function (scope) {
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
                    $log.log("=============================================")
                    $log.log(scope.schemaData);
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
                    var options = {
                        templateUrl: '/app/components/common_directives/panel_delete_dialog.html',
                        scope: scope,
                        preserveScope: true
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


                scope.panelSchema = [{
                    section:'vehicle Details',
                    order:1,
                    description:"vehicle description"
                },{
                    section:"Devices",
                    order:2,
                    description:"device description"
                }];

                scope.getCurrentData = function (panelId) {
                    scope.master = {};
                    scope.master = angular.copy(scope.details);
                    $log.log(panelId);

                    scope.myFunc()
                        .then (function(data){
                            $log.log("inside directive");
                            $log.log(data);
                            angular.element(document.getElementById('fields_content'))
                                .html($compile(scope.fields)(scope));
                            scope.schemaData = data[1];
                            $log.log("received in directive ++++++++++++++++++++++++++");
                            $log.log(scope.schemaData);
                            $log.log(scope.fields);
                        });
                };

                scope.tabs = [
                    { title: 'Nine', content: "<md-input-container>\
                                                  <label>Vehicle Name</label>\
                                                  <input type='text'>\
                                                </md-input-container>"
                    },
                    { title: 'Ten', content: "<md-input-container>\
                                                  <label>Device Name</label>\
                                                  <input type='text'>\
                                                </md-input-container>"
                    }
                ];

                scope.selectedIndex = 0;

                scope.activeTab = function (tabIndex){
                  //   $log.log(scope.tabs[tabIndex].content);
                  //   scope.mycontent = $compile(scope.tabs[tabIndex].content)(scope);
                  // //  scope.tabs[tabIndex].content = $sce.trustAsHtml('<div class="md-display-4">TAB3 CONTENT</div>');
                  //   scope.tabs[tabIndex].content  = $compile(scope.tabs[tabIndex].content)(scope);
                  //   $log.log(scope.tabs[tabIndex].content);
                };

                scope.collapsePanel = function(panelId) {
                    $log.log(panelId);
                    panelId = panelId.toString();
                    $mdExpansionPanel(panelId).collapse();
                    scope.readMode = true;
                };
            }
        }
    }
})();

