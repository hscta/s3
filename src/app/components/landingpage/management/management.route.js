/**
 * Created by smiddela on 22/08/16.
 */

(function() {
    'use strict';

    angular
        .module('uiplatform')
        .config(managementRouter);

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
