
(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('schemaService', schemaService);

    function schemaService() {
        var vm = this;

        vm.parseSchema = function (myScope, schema) {
            myScope.selected = [];
            myScope.toggle = function (item, list) {
                var idx = list.indexOf(item);
                if (idx > -1) {
                    list.splice(idx, 1);
                }
                else {
                    list.push(item);
                }
            };
            myScope.exists = function (item, list) {
                return list.indexOf(item) > -1;
            };

            myScope.chipmodel = [];

            var x = "<div id='demo1'>";
            for ( var i = 0; i < schema.length; i++ ) {

                switch ( schema[i].type ){
                    case "text" : case "number" : case "file" :
                    case "password" : case "email" :
                        x += '<md-input-container>\
                                 <input aria-label="field" placeholder="'+schema[i].name+'" \
                                    type="'+schema[i].type+'"/>\
                              </md-input-container>';
                        break;

                    case 'select':

                        if ( schema[i].selection_type == 'multiple')
                            x += ' <md-select ng-model="fuelType" aria-label="schema[i].name" \
                                placeholder="'+schema[i].name+'" class="md-no-underline" multiple>';
                        else
                            x += ' <md-select ng-model="fuelType" aria-label="schema[i].name" \
                                    placeholder="'+schema[i].name+'" class="md-no-underline">';

                        for ( var j = 0; j < schema[i].val.length; j++ ) {
                            x += '<md-option value="'+schema[i].val[j]+'">'+schema[i].val[j]+'</md-option>';
                        }
                        x += '</md-select>';
                        break;

                    case 'checkbox':
                        myScope.items = [1,2,3,4];
                        x+= '<legend>'+schema[i].name+'</legend>\
                                <div layout="row" layout-wrap flex>\
                                    <div flex="50" ng-repeat="item in items">\
                                        <md-checkbox ng-checked="exists(item, selected)" \
                                            ng-click="toggle(item, selected)">\
                                            {{ item }} \
                                        </md-checkbox>\
                                    </div>\
                                </div>';
                        break;

                    case 'radio' :
                        break;

                    case "chips":
                        x+= '<md-chips \
                                ng-model="chipmodel" \
                                readonly="false" \
                                md-removable="true" \
                                placeholder="Enter a tag" \
                                delete-button-label="Remove Tag" \
                                delete-hint="Press delete to remove tag" \
                                secondary-placeholder="+Tag">\
                            </md-chips>';
                        break;
                }
            }
            x += '</div>';
            return x;
        }
    }
})();