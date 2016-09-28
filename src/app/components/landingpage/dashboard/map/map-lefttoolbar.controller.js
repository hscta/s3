/**
 * Created by smiddela on 12/08/16.
 */

(function () {


    angular
        .module('uiplatform')
        .controller('MapLeftToolBarController', mapLeftToolBar);

    function mapLeftToolBar($scope, $log, $timeout, $q,
                            mapLeftToolBarService, dialogService, intellicarAPI) {

        var vm = this;

        vm.leftToolbar = function () {
            return mapLeftToolBarService.getToolbarVar();
        };

        vm.toggleBar = function () {
            if (vm.leftToolbar()) {
                mapLeftToolBarService.hide();
            } else {
                mapLeftToolBarService.show();
            }
        };

        // vm.handleFences = function (resp) {
        //     $log.log(resp);
        // };
        //
        //
        // vm.readFenceInfo = function (fenceList) {
        //     vm.endTime = new Date().getTime();
        //     $log.log("fence query time = " + (vm.endTime - vm.startTime));
        //     //$log.log(fence);
        //     for (var idx in fenceList) {
        //         var fence = fenceList[idx];
        //         vm.createFenceObjects(fence);
        //         vm.fences[fence.assetpath] = fence;
        //     }
        //     //$log.log(vm.fences);
        //     vm.drawFences();
        // };
        //
        //
        // vm.createFenceObjects = function (fence) {
        //     for (var idx in fence.info) {
        //         var infoitem = fence.info[idx];
        //         infoitem.settingsdata = JSON.parse(infoitem.settingsdata);
        //         if (infoitem.settingstag === 'GEOFENCE_BOUNDARY') {
        //             if (infoitem.settingsdata.fencetype === 'polygon') {
        //                 var gpolygon = vm.getPolygonFromInfo(infoitem.settingsdata);
        //                 gpolygon.info = fence;
        //                 vm.polygons.push(gpolygon);
        //             } else if (infoitem.settingsdata.fencetype === 'circle') {
        //                 var gcircle = vm.getCircleFromInfo(infoitem.settingsdata);
        //                 gcircle.info = fence;
        //                 vm.circles.push(gcircle);
        //             }
        //         }
        //     }
        // };
        //
        //
        // vm.getDefaultPolygon = function () {
        //     return {
        //         path: [],
        //         stroke: {
        //             color: '#08B21F',
        //             weight: 3
        //         },
        //         clickable: true,
        //         visible: true,
        //         editable: false,
        //         draggable: false,
        //         geodesic: false,
        //         fill: {
        //             color: '#08B21F',
        //             opacity: 0.5
        //         }
        //     }
        // };
        //
        //
        // vm.getDefaultCircle = function () {
        //     return {
        //         center: {},
        //         radius: 0,
        //         stroke: {
        //             color: '#08B21F',
        //             weight: 2,
        //             opacity: 1
        //         },
        //         fill: {
        //             color: '#08B21F',
        //             opacity: 0.5
        //         },
        //         clickable: true, // optional: defaults to true
        //         visible: true, // optional: defaults to true
        //         editable: false, // optional: defaults to false
        //         draggable: false, // optional: defaults to false
        //         geodesic: false, // optional: defaults to false
        //         control: {}
        //     }
        // };
        //
        // vm.getPolygonFromInfo = function (polygonInfo) {
        //     //$log.log(polygonInfo);
        //     var gpolygon = vm.getDefaultPolygon();
        //     for (var idx in polygonInfo.vertex) {
        //         var latlng = polygonInfo.vertex[idx];
        //         gpolygon.path.push({latitude: latlng.lat, longitude: latlng.lng});
        //     }
        //     return gpolygon;
        // };
        //
        //
        // vm.getCircleFromInfo = function (circleInfo) {
        //     //$log.log(circleInfo);
        //     var gcircle = vm.getDefaultCircle();
        //     gcircle.center = {latitude: circleInfo.fencecenter.lat, longitude: circleInfo.fencecenter.lng};
        //     gcircle.radius = circleInfo.fenceradius;
        //     return gcircle;
        // };
        //
        // vm.drawFences = function () {
        //     $log.log(vm.circles);
        //     $log.log(vm.polygons);
        // };
        //
        //
        // vm.fetchFences = function (fences) {
        //     vm.fences = {};
        //     vm.circles = [];
        //     vm.polygons = [];
        //
        //     vm.promiseList = [];
        //     for (var idx in fences) {
        //         var body = {geofencepath: fences[idx].assetpath};
        //         vm.promiseList.push(intellicarAPI.geofenceService.getFenceInfoMap(body));
        //     }
        //
        //     $q.all(vm.promiseList)
        //         .then(vm.readFenceInfo, vm.handleFailure);
        // };
        //
        //
        // vm.handleFailure = function (resp) {
        //     $log.log(resp);
        // };
        //
        //
        // vm.getMyFences = function () {
        //     vm.startTime = new Date().getTime();
        //     intellicarAPI.userService.getMyFencesMap({})
        //         .then(vm.fetchFences, vm.handleFailure);
        // };
        //

        vm.leftTB = [
            {
                'name': 'Geofences Reports',
                'icon': 'fa-bar-chart',
                'type': 'button',
                'data': {'type': 'stateChange', 'state': 'home.geofence'}
            },

            {
                'name': 'Geofences ', 'icon': 'fa-globe', 'type': 'button', 'data': {
                'type': 'function', 'function': function (active) {
                    console.log(active);
                    mapLeftToolBarService.getMyFences()
                        .then(function(resp) {
                            //$log.log(resp);
                        }, function(resp) { $log.log(resp); });
                }
            }
            },

            {'type': 'line'},

            {
                'name': 'City Limits', 'icon': 'fa-road', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('City Limits');
                }
            }
            },

            {
                'name': 'Service Center', 'icon': 'fa-wrench', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('Service station');
                }
            }
            },

            {
                'name': 'No Go', 'icon': 'fa-ban', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('No Go');
                }
            }
            },

            {
                'name': 'Low Battery', 'icon': 'fa-battery-quarter', 'type': 'button', 'data': {
                'type': 'function', 'function': function () {
                    console.log('Low Battery');
                }
            }
            }
        ];

        vm.buttonClick = function (data) {
            if (data.type == 'stateChange') {
                dialogService.show(data.state);
            } else if (data.type == 'function') {
                data.active = !data.active;
                data.function(data.active);
            }
        };

        //mapLeftToolBarService.getMyFences();
    }

})();

