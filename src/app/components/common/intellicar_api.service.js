/**
 * Created by smiddela on 19/08/16.
 */


(function() {
    'use strict';

    angular.module('uiplatform')
        .service('intellicarAPI', function($rootScope, $log, $q, API,
                                           userService, requestService,
                                           stateService, treeDataService) {
            var vm = this;
            $log.log("intellicarAPI");

            return {
                userService : userService,
                requestService: requestService,
                stateService: stateService,
                treeDataService: treeDataService
            }

        });
})();
