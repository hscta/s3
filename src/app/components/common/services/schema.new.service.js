/**
 * Created by smiddela on 04/09/16.
 */


(function () {

    'use strict';

    angular
        .module('uiplatform')
        .service('schemaNewService', schemaNewService);

    function schemaNewService($log) {
        var vm = this;
        var str = '';
        vm.parseSchema = function (schema) {
            var mytabs = [];
            for ( var i = 0; i < schema.length; i++ ) {
                var tab = {};
                tab =  { title: schema[i][1], content: ""};

                $log.log(schema[i][2]);
                mytabs.push (tab);
            }
            return ;
        };

    }
})();
