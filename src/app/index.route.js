(function() {
  'use strict';

  angular
    .module('uiplatform')
    .config(routerConfig)

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
      $stateProvider
          // .state('home', {
          //     url: '/',
          //     templateUrl: 'app/main/main1.html',
          //     controller: 'MainController',
          //     controllerAs: 'vm'
          // })

          .state('home', {
              url: '/',
              views: {
                  '': {
                      templateUrl: 'app/main/main.html'
                  },
                  'header@home': {
                      templateUrl: 'app/components/landing/header/header.html',
                      controller: 'HeaderController',
                      controllerAs: 'HeaderController'
                  },
                  'leftnav@home': {
                      templateUrl: 'app/components/landing/leftnav/leftnav.html',
                      controller: 'LeftnavController',
                      controllerAs: 'LeftnavController'
                  },
                  'rightnav@home': {
                      templateUrl: 'app/components/landing/rightnav/rightnav.html',
                      controller: 'RightnavController',
                      controllerAs: 'RightnavController'
                  }
              }
          });

      $urlRouterProvider.otherwise('/');
  }

 })();
