/**
 * Created by harshas on 13/9/16.
 */

(function () {

    angular
        .module('uiplatform')
        .directive('icarEditableList', icarEditableList);

    function icarEditableList($log) {
        return {
            restrict: 'AE',
            template: '<label>{{displayName}}</label>\
                       <md-chips ng-model="data" layout="row" layout-wrap flex="100">\
                            ng-model="data"\
                            readonly="false"\
                            md-removable="true"\
                            placeholder="displayHint"\
                            secondary-placeholder="+Add">\
                       </md-chips>',

            link : function(scope, element, attrs) {
<<<<<<< Updated upstream
                    // $log.log("llllllllllllllllllllllllllllllllllllllllllllllllllllllllllll ");
                    // $log.log(scope.content);
=======
                $log.log(scope.content);
>>>>>>> Stashed changes
                // $log.log(attrs);


                scope.displayName = scope.content.data.displayname;
                scope.dataType = scope.content.data.type;
                scope.displayHint = scope.content.data.displaydesc;
                scope.data = scope.content.data.default;
                scope.editable = scope.content.data.editable;
            }
        }
    }
})();
