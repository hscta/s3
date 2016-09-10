/**
 * Created by smiddela on 10/09/16.
 */


(function () {

    angular
        .module('uiplatform')
        .directive('icarTabContent', icarTabContent)
        .directive('addContent', addContent);

    function icarTabContent($log, $compile, $stateParams) {
        return {
            restrict: 'E',
            template: '<div></div>',
            scope: {
                tabContent: '='
            },

            link: function (scope, element, attrs) {
                $log.log("icar-tab-content loaded");

                scope.parseContent = function(content) {
                    //$log.log("inside parseContent");
                    //$log.log(content);
                    $log.log(element);

                    for(var idx in content) {
                        var child = content[idx];
                        if(idx == '_schema_uidata') {
                            $log.log("child.key = " + child.key);
                            var childScope = scope.$new(false);
                            childScope.content = child;
                            //angular.element(element.children()[0]).append($compile('<input type="text" value="10">')(scope));
                            angular.element(element.children()[0]).append($compile(scope.getIcarDirective(child))(childScope));
                        } else {
                            if(typeof child === 'object') {
                                scope.parseContent(child);
                            }
                        }
                    }
                };


                scope.getIcarDirective = function(content) {
                    $log.log("getIcarDirective");
                    $log.log(content);
                    //return '<' + content.field + ' icar-data="' + content.key + '"><' + content.field + '>';
                    return '<' + content.field + '></' + content.field + '>';
                };

                scope.parseContent(scope.tabContent);
                $log.log(scope.tabContent);
            }
        }
    }

    function addContent($log) {
        $log.log("addContent directive");

        return {
            restrict: 'A',
            compile: function(element, attrs) {
                $log.log(element);
            }
        }
    }
})();

