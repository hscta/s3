/**
 * Created by smiddela on 19/08/16.
 */


(function() {
    'use strict';

    angular.module('uiplatform')
        .service('intellicarAPI', function($rootScope, $log, $q,
                                           appConstants, helperService,
                                           authService, requestService,
                                           stateService, treeDataService,
                                           userService, groupService,
                                           mqttService, schemaService,
                                           reportsService,
                                           anchorSmoothScrollService,
                                           geofenceService,
                                           fenceReportService,
                                           vehicleAPIService,
                                           geocodeService,
                                           permissionService, roleService,
                                           importFileservice, myAlarmService
                                           ) {
            var vm = this;
            $log.log("intellicarAPI");

            return {
                helperService: helperService,
                authService: authService,
                requestService: requestService,
                stateService: stateService,
                treeDataService: treeDataService,
                userService : userService,
                groupService: groupService,
                anchorScrollService : anchorSmoothScrollService,
                appConstants : appConstants,
                mqttService : mqttService,
                schemaService : schemaService,
                reportsService : reportsService,
                geofenceService : geofenceService,
                fenceReportService: fenceReportService,
                vehicleAPIService: vehicleAPIService,
                geocodeService:geocodeService,
                permissionService:permissionService,
                roleService:roleService,
                importFileservice:importFileservice,
                myAlarmService : myAlarmService
            }
        });
})();
