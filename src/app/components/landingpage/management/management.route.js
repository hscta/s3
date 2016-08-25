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
            //         if($state.current.name == 'tab2') {
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

            .state('home.management.tab1', {
                url: '/tab1',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/view1.html',
                        controller: 'Tab1Controller as vm'
                    }
                }
            })
            .state('home.management.tab2', {
                url: '/tab2',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/view2.html',
                        controller: 'Tab2Controller as vm'
                    }
                }
            })
            .state('home.management.tab3', {
                url: '/tab3',
                views: {
                    'mgmttab@home.management': {
                        templateUrl: 'app/components/landingpage/management/settings/view3.html',
                        controller: 'Tab3Controller as vm'
                    }
                }
            })

        $urlRouterProvider.otherwise('/');
    }

})();
