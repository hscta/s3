/**
 * Created by smiddela on 19/08/16.
 */


(function() {
    'use strict';

    angular.module('uiplatform')
        .service('intellicarAPI', function($rootScope, $log, $q,
                                           appConstants,
                                           authService, requestService,
                                           stateService, treeDataService,
                                           userService, groupService,
                                           mqttService,
                                           anchorSmoothScrollService,
                                           schemaDefService
                                           ) {
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
                mqttService : mqttService,
                schemaDefService : schemaDefService
            }
        });
})();