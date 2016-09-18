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
                      templateUrl: 'app/main/main.html',
                      controller: 'MainController as vm'
                  },
                  'header@home': {
                      templateUrl: 'app/components/landingpage/header/header.html',
                      controller: 'HeaderController as vm'
                  },
                  'leftnavtree@home': {
                      templateUrl: 'app/components/landingpage/dashboard/leftnavtree/leftnav_dashboard.html',
                      controller: 'LeftNavDashboardController as vm'
                  },
                  'lefttoolbar@home': {
                      templateUrl: 'app/components/landingpage/dashboard/lefttoolbar/lefttoolbar_dashboard.html',
                      controller: 'LeftToolbarDashboardController as vm'
                  },
                  'center@home': {
                      templateUrl: 'app/components/landingpage/center/center.html',
                      controller: 'CenterController as vm'
                  },
                  'centermain@home': {
                      templateUrl: 'app/components/landingpage/dashboard/map/map.html',
                      controller: 'MapController as vm'
                  },
                  'rightnav@home': {
                      templateUrl: 'app/components/landingpage/dashboard/rightnav/rightnavalert_dashboard.html',
                      controller: 'RightNavDashboardController as vm'
                  }
                  // 'righttoolbar@home': {
                  //     templateUrl: 'app/components/landingpage/dashboard/righttoolbar_dashboard.html',
                  //     controller: 'RightToolbarController as vm',
                  // },

              }
          })
          .state('home.dashboard', {
              url: 'home/dashboard',
              views: {
                  'leftnavtree@home': {
                      templateUrl: 'app/components/landingpage/dashboard/leftnavtree/leftnav_dashboard.html',
                      controller: 'LeftNavDashboardController as vm'
                  },
                  'lefttoolbar@home': {
                      templateUrl: 'app/components/landingpage/dashboard/lefttoolbar/lefttoolbar_dashboard.html',
                      controller: 'LeftToolbarDashboardController as vm'
                  },
                  'centermain@home': {
                      templateUrl: 'app/components/landingpage/dashboard/map/map.html',
                      controller: 'MapController as vm'
                  }
              }
          })
          .state('home.management', {
              url: 'home/management',
              views: {
                  'leftnav@home': {
                      templateUrl: 'app/components/landingpage/management/leftnav/leftnav_mgmt.html',
                      controller: 'LeftNavManagementController as vm'
                  },
                  'lefttoolbar@home': {
                      templateUrl: 'app/components/common/views/emptydiv.html',
                      controller: 'LeftToolbarDashboardController as vm'
                  },
                  'centermain@home': {
                      templateUrl: 'app/components/landingpage/management/settings/tabs/settings.html',
                      controller: 'SettingsController as vm'
                  },
                  'mgmttab@home.management': {
                      templateUrl: 'app/components/landingpage/management/settings/vehicle/vehicle_mgmt.html',
                      resolve: {
                          startupData : function($stateParams, $log, vehicleMgmtService, settingsService, $state) {
                              //$log.log("index.route toState " + $state.current.name);
                              //$log.log($state);
                              return vehicleMgmtService.getData(settingsService.getCurrentGroup());
                          }
                      },
                      controller: 'VehicleMgmtController as vm'
                  }
              }
          })
          .state('home.reports', {
              url: 'home/reports',
              views: {
                  'leftnavtree@home': {
                      templateUrl: 'app/components/landingpage/dashboard/leftnavtree/leftnav_dashboard.html',
                      controller: 'LeftNavDashboardController as vm'
                  },
                  'lefttoolbar@home': {
                      templateUrl: 'app/components/common/views/emptydiv.html',
                      controller: 'LeftToolbarDashboardController as vm'
                  },
                  'centermain@home': {
                      templateUrl: 'app/components/landingpage/reports/reports.html',
                      controller: 'ReportsController as vm'
                  }
              }
          })


      $urlRouterProvider.otherwise('/');
  }

 })();
