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
		  .state('login', {
                url: '/login',
                views: {
                    '': {
                        templateUrl: 'app/main/login.html',
                        controller: 'LoginController as vm'
                    },
                     'header@login': {
                        templateUrl: 'app/components/landingpage/header/header.html',
                        controller: 'HeaderController as vm'
                    }
                }
            })
            .state('admin', {
                url: '/',
                views: {
					'leftnavtree@admin': {
                        templateUrl: 'app/main/leftnavtree/leftnav_dashboard.html',
                        controller: 'LeftNavDashboardController as vm'
                    },
                    '': {
                        templateUrl: 'app/main/admin.html',
                        controller: 'AdminController as vm'
                    },
                     'header@admin': {
                        templateUrl: 'app/components/landingpage/header/header.html',
                        controller: 'HeaderController as vm'
                    },
					
                }
            })
			.state('customer', {
                url: '/customer',
                views: {
                    '': {
                        templateUrl: 'app/main/admin2.html',
                        controller: 'BranchController as vm'
                    },
                     'header@customer': {
                        templateUrl: 'app/components/landingpage/header/header.html',
                        controller: 'HeaderController as vm'
                    }
                }
            })
			
			.state('dealer', {
                url: '/dealer',
                views: {
                    '': {
                        templateUrl: 'app/main/dealer.html',
                        controller: 'DealerController as vm'
                    },
                     'header@dealer': {
                        templateUrl: 'app/components/landingpage/header/header.html',
                        controller: 'HeaderController as vm'
                    }
                }
            })
			
			.state('technician', {
                url: '/technician',
                views: {
                    '': {
                        templateUrl: 'app/main/technician.html',
                        controller: 'TechnicianController as vm'
                    },
                     'header@technician': {
                        templateUrl: 'app/components/landingpage/header/header.html',
                        controller: 'HeaderController as vm'
                    }
                }
            })
          
			$urlRouterProvider.otherwise('/login');
    }

})();
