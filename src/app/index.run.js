(function() {

    'use strict';

    angular
        .module('uiplatform')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $state, $log) {
        $log.log("runBlock");
        //$rootScope.$emit('getData', {'login': true});
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
