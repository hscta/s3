/**
 * Created by smiddela on 22/08/16.
 */

(function() {
    'use strict';

    angular
        .module('uiplatform')
        .config(managementRouter)
        .run(function($rootScope, $log, $state) {

            $rootScope.transitionTo = function(state, params) {

                $state.transitionTo(state, params, { location: true, inherit: true,
                    relative: $state.$current, notify: true });
            }

            // $rootScope.checkState = function (state) {
            //     return $state.current.name == state ? true : false;
            // }

            // $rootScope.$on('$stateChangeSuccess',
            //     function(event, toState, toParams, fromState, fromParams){
            //
            //
            //         if($state.current.name == 'group') {
            //             $rootScope.tab = { selected : 1 }
            //         } else {
            //             $rootScope.tab = { selected : 0 }
            //         }
            //     })

            //$log.log($rootScope.tab);
        });


    /** @ngInject */
    function managementRouter($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('home.management.vehicle', {
                url: '/vehicle',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/vehicle_mgmt.html',
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
