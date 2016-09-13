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
            template: '<div style="overflow:hidden;"></div>',
            scope: {
                tabContent: '='
            },

            link: function (scope, element, attrs) {
                $log.log("icar-tab-content loaded");

                scope.parseContent = function(content, parentDiv) {
                    var newElement = $compile('<fieldset layout="row" style="border:1px solid #ccc;"></fieldset>')(scope);
                    parentDiv.append(newElement);
                    // $log.log(element);

                    for(var idx in content) {
                        var child = content[idx];
                        if(idx == '_schema_uidata') {
                            // $log.log("child.key = " + child.key);
                            var childScope = scope.$new(false);
                            childScope.content = child;
                            newElement.append($compile(scope.getIcarDirective(child))(childScope));
                        } else {
                            if(typeof child === 'object') {
                                scope.parseContent(child, newElement);
                            }
                        }
                    }
                };


                scope.getIcarDirective = function(content) {
                    return '<legend>'+content.key+'</legend><' + content.field + '></' + content.field + '>';
                };

                scope.parseContent(scope.tabContent, angular.element(element.children()[0]));
            }
        }
    }

    function addContent($log) {
        return {
            restrict: 'A',
            compile: function(element, attrs) {
                $log.log(element);
            }
        }
    }
})();

