(function() {
    'use strict';

    angular
        .module('uiplatform')
        .config(routerConfig)
        .filter('titleCase', function() {
            return function(input) {
                input = input || '';
                return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase()
                    + txt.substr(1).toLowerCase();});
            };
        });

    /** @ngInject */
    function routerConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    '': {
                        templateUrl: 'app/main/main.html',
                        controller: 'MainController as vm'
                    },
                     'header@home': {
                        templateUrl: 'app/components/landingpage/header/header.html',
                        controller: 'HeaderController as vm'
                    }
                }
            })
          
			$urlRouterProvider.otherwise('/');
    }

})();
