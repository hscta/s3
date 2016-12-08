(function() {

    'use strict';

    angular
        .module('uiplatform')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $state, $log,  $location, $window) {
        $log.log("runBlock");
        $rootScope.showLoginDialog = true;
        //$rootScope.$emit('getData', {'login': true});

        $window.ga('create', 'UA-86820286-2', 'auto');

        // track pageview on state change
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
        });
    }



  // angular
  //   .module('uiplatform')
  //   .run(runBlock);
  //
  // /** @ngInject */
  // function runBlock($rootScope, $state, loginModal) {
  //
  //   $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
  //     var requireLogin = true;
  //     //var requireLogin = toState.data.requireLogin ? true : false;
  //
  //     if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
  //       event.preventDefault();
  //
  //       loginModal()
  //           .then(function () {
  //             return $state.go(toState.name, toParams);
  //           })
  //           .catch(function () {
  //             return $state.go('welcome');
  //           });
  //     }
  //   });
  //
  // }

})();
