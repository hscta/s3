/**
 * Created by smiddela on 06/09/16.
 */


(function () {

    angular
        .module('uiplatform')
        .directive('multiList', multiList);

    function multiList() {

        return {
            restrict: 'E',
            scope :{
                popup:'=data',
            },
            templateUrl: 'app/components/common/directives/multi-list.html',

            link:function(scope){

                scope.defaultClick = function(param,callback){

                    var processGUI = function(id){
                        param.item.processing = false;
                        for(var idx=0; idx < param.object.list.length; idx++){
                            if(param.object.list[idx].id == param.item.id){
                                param.object.list.splice(idx,1);
                            }
                        }
                        param.data[param.object.id + id].list.unshift(param.item);
                    }

                    if(param.item.processing != true){
                        param.item.processing = true;
                        callback(processGUI);
                    }
                }
            }
        };
    }
})();

