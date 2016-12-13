/**
 * Created by Rinas Musthafa on 11/27/2016.
 */

(function () {
    angular
        .module('uiplatform')
        .controller('DownloadHistoryController', DownloadHistoryController)

    function DownloadHistoryController(dialogService, userService, reportsService,
                                       intellicarAPI, $timeout, $log) {

        var vm = this;
        dialogService.setTab(4);

        vm.showLoading = false;

        userService.getMyAssignedGroupsMap({})
            .then(function (data) {
                // console.log(data);
                vm.groups = sortArray(data);
                vm.selectedGroup = vm.groups[0];
            });

        function sortArray(data) {
            var sorted = [];
            for (var idx in data) {
                if (sorted.length > 0) {
                    var pushed = false;
                    for (var jdx in sorted) {
                        if (sorted[jdx].assetpath.split('/').length > data[idx].assetpath.split('/').length) {
                            sorted.splice(parseInt(jdx), 0, data[idx]);
                            pushed = true;
                            break;
                        }
                    }
                    if (!pushed) {
                        sorted.push(data[idx]);
                    }
                } else {
                    sorted.push(data[idx]);
                }
            }
            return sorted;
        }

        vm.download = function () {
            downloadCSV();
            vm.showLoading = true;
            vm.errorMsg = null;
        };

        function downloadCSV() {
            reportsService.getGPSLastseen({"grouppath": vm.selectedGroup.assetpath, "recursive": 1})
                .then(vm.handleSuccess, vm.handleFailure);
        }


        vm.handleFailure = function (resp ){
            $log.log(resp.data.msg);

            if ( resp.data.msg )
                vm.errorMsg = resp.data.msg;
            vm.showLoading = false;
        }


        vm.handleSuccess = function (resp) {
            $log.log(resp.data.msg);
            if (resp.data.msg)
                vm.errorMsg = resp.data.msg;
            var dateFormat = 'DD-MM-YYYY HH:mm';
            var csvData = resp.data.data;
            var csvArray = [];

            for (var idx in csvData) {

                var lastcom = moment.unix(csvData[idx].utctime / 1000).format(dateFormat) + " ";
                var pullout = 'ATTATCHED';
                if (csvData[idx].carb < 1) {
                    pullout = 'PULLOUT';
                }
                var mobility = 'ACTIVE';
                if (csvData[idx].mobili == 1) {
                    mobility = 'IMMOBILIZED';
                }
                var communication = 'Live';
                var currentTime = new Date().getTime();
                var lastSeenAt = csvData[idx].utctime;
                var noCommThreshold = 8 * 3600 * 1000;
                if (currentTime - lastSeenAt > noCommThreshold) {
                    communication = 'No Comm';
                }
                var gpstime = moment.unix(csvData[idx].gpstime / 1000).format(dateFormat) + " ";
                csvArray.push({
                    "VEHICLE NO": csvData[idx].vehicleno,
                    "LAST COMM AT": lastcom,
                    "PULL OUT": pullout,
                    "MOBILITY": mobility,
                    "COMMUNICATION": communication,
                    "GPS TIME": gpstime
                })
            }


            getAddress(csvData, function (address) {
                for (var idx in csvArray) {
                    csvArray[idx]["ADDRESS"] = address[idx][1];
                    csvArray[idx]["LAT LNG"] = csvData[idx].lat + ', ' + csvData[idx].lat;
                }
                intellicarAPI.importFileservice.JSONToCSVConvertor(csvArray, "Vehicles History Report", true);

                $timeout ( function () {
                    vm.showLoading = false;
                }, 1000);
            });


            function getAddress(csvData, callback) {
                var postBody = {data: []};
                for (var idx in csvData) {
                    postBody.data.push([csvData[idx].lat, csvData[idx].lng]);
                }
                //console.log('im firing');
                intellicarAPI.geocodeService.getAddress(postBody)
                    .then(function (resp) {
                        callback(resp.data.data);
                    })
            }


        }

    }
})();
