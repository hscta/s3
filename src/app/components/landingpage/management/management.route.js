/**
 * Created by smiddela on 22/08/16.
 */

(function() {
    'use strict';

    angular
        .module('uiplatform')
        .config(managementRouter)
        .run(function($rootScope, $log, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        });


    /** @ngInject */
    function managementRouter($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('home.management.vehicle', {
                url: '/vehicle',
                params: {
                    info : null
                },
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/vehicle/vehicle_mgmt.html',
                        resolve: {
                            startupData : function($stateParams, $log, vehicleMgmtService, $state) {
                                $log.log("toState " + $state.current.name);
                                $log.log($stateParams);
                                return vehicleMgmtService.getData($stateParams);
                            }
                        },
                        controller: 'VehicleMgmtController as vm'
                    }
                }
            })
            .state('home.management.group', {
                url: '/group',
                params: {
                    info : null
                },
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/group/group_mgmt.html',
                        resolve: {
                            startupData : function($stateParams, $log, groupMgmtService, $state) {
                                $log.log("current State " + $state.current.name);
                                $log.log($stateParams);
                                return groupMgmtService.getData($stateParams);
                            }
                        },
                        controller: 'GroupMgmtController as vm'
                    }
                }
            })
            .state('home.management.user', {
                url: '/user',
                params: {
                    info : null
                },
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/user/user_mgmt.html',
                        resolve: {
                            startupData : function($stateParams, $log, userMgmtService, $state) {
                                $log.log("toState " + $state.current.name);
                                $log.log($stateParams);
                                return userMgmtService.getData($stateParams);
                            }
                        },
                        controller: 'UserMgmtController as vm'
                    }
                }
            })
            .state('home.management.role', {
                url: '/role',
                params: {
                    info : null
                },
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/role/role_mgmt.html',
                        resolve: {
                            startupData : function($stateParams, $log, roleMgmtService, $state) {
                                $log.log("toState " + $state.current.name);
                                // $log.log($stateParams);
                                return roleMgmtService.getData($stateParams);
                            }
                        },
                        controller: 'RoleMgmtController as vm'
                    }
                }
            })
            .state('home.management.device', {
                url: '/device',
                params: {
                    info : null
                },
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/device/device_mgmt.html',
                        resolve: {
                            startupData : function($stateParams, $log, deviceMgmtService, $state) {
                                $log.log("toState " + $state.current.name);
                                $log.log($stateParams);
                                return deviceMgmtService.getData($stateParams);
                            }
                        },
                        controller: 'DeviceMgmtController as vm'
                    }
                }
            });

        $urlRouterProvider.otherwise('/');
    }

})();
