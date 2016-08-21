/**
 * Created by smiddela on 08/08/16.
 */
(function() {

    'use strict';

    angular
        .module('uiplatform')
        .service('treeDataService', treeDataService);

    function treeDataService($rootScope, $log) {
        var vm = this;
        $log.log("treeDataService");

        vm.management_tree_data = function(data) {
            console.log(data.data.data);
            var nodes = data.data.data;
            var map = {}, node, roots = [];
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.nodes = [];
                var group_id = node.pgrouppath.split('/');
                group_id.shift();
                var pgroupid ;
                var real_groupid=[];
                var tgroupid;


                for ( var j = 0; j < group_id.length; j++ ) {
                    if ( !(j%2 == 0) )
                        real_groupid.push(group_id[j]);
                }
                tgroupid = real_groupid[real_groupid.length-1];
                if ( real_groupid.length <= 1 )
                    pgroupid = tgroupid;
                else
                    pgroupid = real_groupid[real_groupid.length-2];

                map[tgroupid] = i;
                if (pgroupid != tgroupid) {
                     nodes[map[pgroupid]].nodes.push(node);
                 } else {
                     roots.push(node);
                 }
                console.log('sss');
            }
            return roots;
        };

        // vm.dashboard_tree_data = function(data) {
        //     console.log(data.data.data);
        //     var nodes = data.data.data;
        //     var map = {}, node, roots = [];
        //     for (var i = 0; i < nodes.length; i += 1) {
        //         node = nodes[i];
        //         node.nodes = [];
        //         map[node.vehicleid] = i; // use map to look-up the parents
        //         if (node.pgroupid != node.vehicleid) {
        //                 nodes[map[node.pgroupid]].nodes.push(node);
        //         } else {
        //             roots.push(node);
        //         }
        //     }
        //     console.log(roots);
        //     return roots;
        // };
    }

})();

