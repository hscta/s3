/**
 * Created by harshas on 3/9/16.
 */

(function() {

    angular
        .module('uiplatform')
        .controller('DeviceSchemaController', DeviceSchemaController);

    function DeviceSchemaController ($compile, schemaService, $log, $scope, $document) {
        var vm = this;
        var schema = [
            {
                name:"Device Type",
                type:"select",
                val:["option1", "option2", "option3"],
                selcted_val:["option1"]
            }, {
                name:"multiselect",
                type:"select",
                val:["option1", "option2", "option3"],
                selcted_val:["option1"],
                selection_type:"multiple"
            }, {
                name:"Car Number",
                type:"text"
            }, {
                name:"Chassis Number",
                type:"number"
            }, {
                name:"E-mail",
                type:"email"
            }, {
                name:"Chips Field",
                type:"chips",
                readonly:false,
                max_chips:"10"
            }, {
                name:"Checkbox Field",
                type:"checkbox",
                values:[]
            },
        ];
        vm.str = schemaService.parseSchema($scope, schema);
        angular.element(document.getElementById('demo')).append($compile(vm.str)($scope));
    };

})();
