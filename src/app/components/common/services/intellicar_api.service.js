/**
 * Created by smiddela on 19/08/16.
 */


(function() {
    'use strict';

    angular.module('uiplatform')
        .service('intellicarAPI', function($rootScope, $log, $q,
                                           authService, requestService,
                                           stateService, treeDataService,
                                           userService, groupService,
                                           mqttService,
                                           anchorSmoothScrollService,
                                           appConstants) {
            var vm = this;
            $log.log("intellicarAPI");

            return {
                authService: authService,
                requestService: requestService,
                stateService: stateService,
                treeDataService: treeDataService,
                userService : userService,
                groupService: groupService,
                anchorScrollService : anchorSmoothScrollService,
                appConstants : appConstants,
                mqttService : mqttService
            }
        });
})();
