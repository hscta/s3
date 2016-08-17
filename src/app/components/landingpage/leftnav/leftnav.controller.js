// /**
//  * Created by smiddela on 13/08/16.
//  */
//
// (function() {
//
//     angular
//         .module('uiplatform')
//         .controller('LeftNavDashboardController', LeftNavDashboardController);
//
//     function LeftNavDashboardController($scope, $rootScope, navService, $mdSidenav, $log, $document, leftnavService, requestService) {
//
//         $log.log('LeftNavDashboardController');
//         var vm = this;
//         $scope.assetTree = {};
//         $scope.showLeftnav = true;
//
//         vm.createTree = function(data) {
//             $log.log("controller treeCallback");
//             $log.log(data);
//             $scope.assetTree = data;
//         }
//
//         vm.getTree = function() {
//             $log.log("controller getTree");
//             leftnavService.getTree();
//         }
//
//         vm.getData = function(event, data) {
//             $log.log('my my my getData');
//             $log.log(event);
//             $log.log(data);
//             vm.getTree();
//         }
//
//         vm.toggleLeftnav = function() {
//             $log.log("calling leftnav");
//             $scope.showLeftnav = !$scope.showLeftnav;
//             //return !$scope.showLeftnavb;
//         }
//
//         $scope.$on('toggleLeftnav', vm.toggleLeftnav);
//
//         leftnavService.treeCallback = vm.createTree;
//
//         vm.getTree();
//     }
// })();
