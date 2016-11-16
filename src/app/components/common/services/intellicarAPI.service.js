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
                                           reportService,
                                           anchorSmoothScrollService,
                                           geofenceService,
                                           fenceReportService,
                                           vehicleAPIService,
                                           myAlarmService, geocodeService,
                                           importFileservice

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
                reportService : reportService,
                geofenceService : geofenceService,
                fenceReportService: fenceReportService,
                vehicleAPIService: vehicleAPIService,
                myAlarmService: myAlarmService,
                geocodeService:geocodeService,
                importFileservice:importFileservice
            }
        });
})();
