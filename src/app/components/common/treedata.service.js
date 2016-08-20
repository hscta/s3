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
                map[node.groupid] = i; // use map to look-up the parents
                if (node.pgroupid != node.groupid) {
                    nodes[map[node.pgroupid]].nodes.push(node);
                } else {
                    roots.push(node);
                }
            }
            console.log(roots);
            return roots;
        };

        vm.dashboard_tree_data = function(data) {
            console.log(data.data.data);
            var nodes = data.data.data;
            var map = {}, node, roots = [];
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.nodes = [];
                map[node.vehicleid] = i; // use map to look-up the parents
                if (node.pgroupid != node.vehicleid) {
                        nodes[map[node.pgroupid]].nodes.push(node);
                } else {
                    roots.push(node);
                }
            }
            console.log(roots);
            return roots;
        };
    }

})();

