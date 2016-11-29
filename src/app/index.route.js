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
                        templateUrl: 'app/components/landingpage/dashboard/map/map2.html',
                        controller: 'GoogleMapController as vm'
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
                    }
                    // 'centermain@home': {
                    //     templateUrl: 'app/components/landingpage/dashboard/map/map.html',
                    //     controller: 'MapController as vm'
                    // }
                }
            })
            .state('home.management', {
                url: 'home/management',
                resolve: {
                    startupTreeData : function($stateParams, $log, $q, $state, $rootScope,
                                           settingsService, intellicarAPI) {
                        $log.log($stateParams);
                        $log.log($state);

                        var handleGetMyInfo = function (resp) {
                            var userinfo = resp.data.data[0];
                            // console.log(userinfo);
                            var pgrouppath = intellicarAPI.helperService.getParentFromPath(userinfo.assetpath);
                            settingsService.setCurrentGroupPath(pgrouppath);
                            // console.log(settingsService.getCurrentGroup());
                            return pgrouppath;
                        };


                        var handleFailure = function (resp) {
                            $log.log("handleFailure");
                            $log.log(resp);
                            return resp;
                        };


                        return intellicarAPI.userService.getMyInfo({})
                            .then(handleGetMyInfo, handleFailure);

                        // $log.log('in management left nav');
                        // return $q.resolve({startupData: 'my startup data'});
                    }
                },
                views: {
                    'leftnavtree@home': {
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
                        // resolve: {
                        //     startupData : function($state, $stateParams, $log, vehicleMgmtService,
                        //                            settingsService, userprefService) {
                        //         return vehicleMgmtService.getData(settingsService.getCurrentGroup());
                        //     }
                        // },
                        controller: 'VehicleMgmtController as vm'
                    },
                    'rightnav@home': {
                        templateUrl: 'app/components/landingpage/management/rightnav/rightnav_mgmt.html',
                        controller: 'RightNavMgmtController as vm'
                    }
                }
            })
            .state('home.history', {
                url: 'history',
                params: {
                    mapObj: null
                },
                views: {
                    'dialogview@home': {
                        templateUrl: 'app/components/landingpage/dashboard/map/dialog/history.html',
                        controller: 'History2Controller as vm'
                    }
                }
            })
            .state('home.historyData', {
                url: 'historyData',
                params: {
                    mapObj: null
                },
                views: {
                    'dialogview@home': {
                        templateUrl: 'app/components/landingpage/dashboard/map/dialog/historyTable.html',
                        controller: 'HistoryTableController as vm'
                    }
                }
            })
            .state('home.alarm', {
                url: 'alarm',
                views: {
                    'dialogview@home': {
                        templateUrl: 'app/components/landingpage/dashboard/map/dialog/alarm.html',
                        controller: 'AlarmController as vm'
                    }
                }
            })
            .state('home.geofence', {
                url: 'geofence',
                views: {
                    'dialogview@home': {
                        templateUrl: 'app/components/landingpage/dashboard/map/dialog/geofence.html',
                        controller: 'GeofenceReportController as vm'
                    }
                }
            })
            .state('home.reports', {
                url: 'home/reports',
                views: {
                    'leftnavtree@home': {
                        templateUrl: 'app/components/landingpage/management/leftnav/leftnav_mgmt.html',
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
            });


        $urlRouterProvider.otherwise('/');
    }

})();
