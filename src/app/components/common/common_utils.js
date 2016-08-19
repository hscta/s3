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

        vm.management_tree_data = function(data) {
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

        };
        vm.dashboard_tree_data = function(data) {
            var nodes = data.data.data;
            var map = {}, node, roots = [];
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.nodes = [];
                map[node.vehicleid] = i; // use map to look-up the parents
                var main_node_id = nodes[i].vehicleid;
                if (node.pgroupid != node.vehicleid) {console.log('child');
                    nodes[map[node.pgroupid]].nodes.push(node);
                } else {console.log('parent');
                    roots.push(node);
                }
            }

            return roots;
            console.log(roots);

        };
    }

})();

