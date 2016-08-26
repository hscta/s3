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
                views: {
                    '': {
                        templateUrl: 'app/main/main.html',
                        controller: 'MainController as vm'
                    },
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/vehicle_mgmt.html',
                        resolve: {
                            loadTimeData : function($stateParams, $log) {
                                $log.log('gotcha');
                                $log.log($stateParams);
                                //return q.resolve($stateParams);
                            }
                        },
                        controller: 'VehicleMgmtController as vm'
                    }
                }
            })
            .state('home.management.group', {
                url: '/group',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/group_mgmt.html',
                        controller: 'GroupMgmtController as vm'
                    }
                },
            })
            .state('home.management.user', {
                url: '/user',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/user_mgmt.html',
                        controller: 'UserMgmtController as vm'
                    }
                },
            })
            .state('home.management.role', {
                url: '/role',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/role_mgmt.html',
                        controller: 'RoleMgmtController as vm'
                    }
                }
            })
            .state('home.management.device', {
                url: '/device',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/device_mgmt.html',
                        controller: 'DeviceMgmtController as vm'
                    }
                },
            })

        $urlRouterProvider.otherwise('/');
    }

})();
