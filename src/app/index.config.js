(function() {
    'use strict';

    angular
        .module('uiplatform')
        //.service('loginModal', loginModal)
        .config(themeConfig)

        // .config(loginModalConfig)
    // function loginModal($uibModal, $rootScope) {
    //     console.log("loginModal");
    //     function assignCurrentUser(user) {
    //         $rootScope.currentUser = user;
    //         return user;
    //     }
    //
    //     return function () {
    //         var instance = $uibModal.open({
    //             templateUrl: 'app/components/login/loginModalTemplate.html',
    //             controller: 'LoginModalCtrl',
    //             controllerAs: 'LoginModalCtrl'
    //         })
    //
    //         return instance.result.then(assignCurrentUser);
    //     };
    //
    // }
    //
    //
    // /** @ngInject */
    // function loginModalConfig($httpProvider) {
    //
    //     $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
    //         var loginModal, $http, $state;
    //
    //         // this trick must be done so that we don't receive
    //         // `Uncaught Error: [$injector:cdep] Circular dependency found`
    //         $timeout(function () {
    //             loginModal = $injector.get('loginModal');
    //             $http = $injector.get('$http');
    //             $state = $injector.get('$state');
    //         });
    //
    //         return {
    //             responseError: function (rejection) {
    //                 if (rejection.status !== 401) {
    //                     return rejection;
    //                 }
    //
    //                 var deferred = $q.defer();
    //
    //                 loginModal()
    //                     .then(function () {
    //                         deferred.resolve($http(rejection.config));
    //                     })
    //                     .catch(function () {
    //                         $state.go('welcome');
    //                         deferred.reject(rejection);
    //                     });
    //
    //                 return deferred.promise;
    //             }
    //         };
    //     });
    //
    // }


    function themeConfig($mdIconProvider, $mdThemingProvider) {
        $mdThemingProvider
            .theme('default')
            .primaryPalette('grey', {
                'default': '600'
            })
            .accentPalette('teal', {
                'default': '500'
            })
            .warnPalette('defaultPrimary');

        $mdThemingProvider.theme('dark', 'default')
            .primaryPalette('defaultPrimary')
            .dark();

        $mdThemingProvider.theme('grey', 'default')
            .primaryPalette('grey');

        $mdThemingProvider.theme('custom', 'default')
            .primaryPalette('defaultPrimary', {
                'hue-1': '50'
            });

        $mdThemingProvider.definePalette('defaultPrimary', {
            '50': '#FFFFFF',
            '100': 'rgb(255, 198, 197)',
            '200': '#E75753',
            '300': '#E75753',
            '400': '#E75753',
            '500': '#E75753',
            '600': '#E75753',
            '700': '#E75753',
            '800': '#E75753',
            '900': '#E75753',
            'A100': '#E75753',
            'A200': '#E75753',
            'A400': '#E75753',
            'A700': '#E75753'
        });


        $mdIconProvider.icon('user', 'assets/images/user.svg', 64);

    }

})();
