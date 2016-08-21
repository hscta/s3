(function() {
  'use strict';

  angular
    .module('uiplatform')
    .config(routerConfig);

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
                  'leftnav@home': {
                      templateUrl: 'app/components/landingpage/dashboard/leftnav/leftnav_dashboard.html',
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
                      templateUrl: 'app/components/landingpage/rightnav/rightnav_notifications.html',
                      controller: 'RightnavController as vm'
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
                  'leftnav@home': {
                      templateUrl: 'app/components/landingpage/dashboard/leftnav/leftnav_dashboard.html',
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
                      templateUrl: 'app/components/landingpage/management/leftnav/leftnav_management.html',
                      controller: 'LeftNavManagementController as vm'
                  },
                  'lefttoolbar@home': {
                      templateUrl: 'app/components/common/views/emptydiv.html',
                      controller: 'LeftToolbarDashboardController as vm'
                  },
                  'centermain@home': {
                      templateUrl: 'app/components/landingpage/management/settings/settings.html',
                      controller: 'SettingsController as vm'
                  }
              }
          })
          .state('home.managemtab1', {
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
          .state('home.reports', {
              url: 'home/reports',
              views: {
                  'leftnav@home': {
                      templateUrl: 'app/components/landingpage/dashboard/leftnav/leftnav_dashboard.html',
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
