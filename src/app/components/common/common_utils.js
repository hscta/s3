/**
 * Created by smiddela on 08/08/16.
 */
(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('treeDataService', treeDataService)

    function treeDataService($rootScope, $log) {
        var vm = this;
        $log.log("leftNavDashboardService");

        vm.arrange_data = function(data) {
            console.log(data.data.data);
            var nodes = data.data.data;
            var map = {}, node, roots = [];
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.nodes = [];
                map[node.groupid] = i; // use map to look-up the parents
                var main_node_id = nodes[i].groupid;
                console.log(node.pgroupid, node.groupid);
                if (node.pgroupid != node.groupid) {console.log('child');
                    nodes[map[node.pgroupid]].nodes.push(node);
                } else {console.log('parent');
                    roots.push(node);
                }
            }

            for ( var i = 0; i < roots.length; i++ ) {
                var node_id = roots[i].groupid;
                roots[i].id = node_id;
            }

            return roots;
            console.log(roots);









            // $log.log("handleResponse");
            // $log.log(data.data.data);
            //
            // var my_tree = [];
            // var pnodes = [];
            // var unique_group_ids = [];
            // var tree_data = [];
            //
            // angular.forEach(data.data.data,function(value,index){
            //     pnodes[value.pgroupid] = {};
            //     unique_group_ids[value.groupid] = {}
            //     var mykey = value.groupid;
            //     my_tree[value.groupid] = {};
            //     my_tree[value.groupid]['data'] = [];
            //     my_tree[value.groupid]['data']['assetlevel'] = value.assetlevel;
            //     my_tree[value.groupid]['data']['groupid'] = value.groupid;
            //     my_tree[value.groupid]['data']['grouppath'] = value.grouppath;
            //     my_tree[value.groupid]['data']['pgroupid'] = value.pgroupid;
            //     my_tree[value.groupid]['data']['pname'] = value.pname;
            //     my_tree[value.groupid]['data']['name'] = value.name;
            //     my_tree[value.groupid]['data']['pgrouppath'] = value.pgrouppath;
            // });
            //
            // var grand_parents = [];
            // var exists = 0;//if exists <= 1 than it is a main node
            // var parent_nodes = [];
            //
            // for(var key in pnodes) {//Convert json to list
            //     parent_nodes.push(key);
            // }
            //
            // for ( var i = 0; i < parent_nodes.length; i++ ) {
            //     for ( var j = 0; j < data.data.data.length; j++ ) {
            //         if (parent_nodes[i] ==  data.data.data[i].pgroupid){
            //             exists++;
            //         }
            //         if (exists >= 2){
            //             exists = 0;
            //             var str = data.data.data[i].pgroupid.toString();
            //             var found = parent_nodes.indexOf(str);
            //             if (found >= 0){
            //                 grand_parents.push(parent_nodes[i]);
            //                 parent_nodes.splice(found, 1);
            //             }
            //         }
            //     }
            // }
            //
            // var group_ids = [];
            // for(var key in unique_group_ids) {//Convert json to list
            //     group_ids.push(key);
            // }
            //
            // console.log(group_ids);
            // for (var i = 0; i < grand_parents.length; i++){
            //     var node_pointer = grand_parents[i];
            //     node_pointer = node_pointer.toString();
            //
            //     var data = {};
            //     data['id'] = node_pointer;
            //     data['assetlevel'] = my_tree[grand_parents[i]]['data']['name'];
            //     data['groupid'] = my_tree[grand_parents[i]]['data']['groupid'];
            //     data['grouppath'] = my_tree[grand_parents[i]]['data']['grouppath'];
            //     data['pgroupid'] = my_tree[grand_parents[i]]['data']['pgroupid'];
            //     data['pname'] = my_tree[grand_parents[i]]['data']['pname'];
            //     data['pgrouppath'] = my_tree[grand_parents[i]]['data']['pgrouppath'];
            //     data['name'] = my_tree[grand_parents[i]]['data']['name'];
            //     data['nodes'] = [];
            //
            //     var cur_node = grand_parents[i];
            //
            //     for ( var j = 0; j < group_ids; j++ ){
            //         if ( cur_node == my_tree[group_ids[j]]['data']['pgroupid']){
            //            var inner_data = {};
            //
            //         }
            //     }
            //     tree_data.push(data);
            // }
            // console.log(data.data);
            //
            // console.log(my_tree);
        };
    }

})();

