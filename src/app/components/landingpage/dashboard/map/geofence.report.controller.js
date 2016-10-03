(function () {


    angular
        .module('uiplatform')
        .controller('GeofenceReportController', GeofenceReportController);

    function GeofenceReportController($log, $q, dialogService, geofenceReportService) {

        $log.log("GeofenceReportController");

        dialogService.setTab(1);
        var vm = this;
        vm.reports = [
            {
                'id': 1, 'name': 'Report 1', 'fences': [
                {
                    'id': 1, 'name': 'Fence 1', 'vehicles': [
                    {'id': 1, 'name': 'bmw m3'},
                    {'id': 1, 'name': 'Nissan'},
                    {'id': 1, 'name': 'Ferrari'}
                ]
                },
                {
                    'id': 1, 'name': 'Fence 2', 'vehicles': [
                    {'id': 1, 'name': 'Ford Mustang'},
                    {'id': 1, 'name': 'Porsh Cerrare'},
                    {'id': 1, 'name': 'Ferrari GT'}
                ]
                },
            ]
            },
            {
                'id': 2, 'name': 'Report 2', 'fences': [
                {
                    'id': 1, 'name': 'Fence 4', 'vehicles': [
                    {'id': 1, 'name': 'Nissan'},
                    {'id': 1, 'name': 'bmw m3'},
                    {'id': 1, 'name': 'Porsh Cerrare'},
                    {'id': 1, 'name': 'Porsh Cerrare M3'},
                    {'id': 1, 'name': 'Ferrari'}
                ]
                },
                {
                    'id': 1, 'name': 'Fence 5', 'vehicles': [
                    {'id': 1, 'name': 'bmw m3'},
                    {'id': 1, 'name': 'Ford Mustang'},
                    {'id': 1, 'name': 'Porsh Cerrare'},
                    {'id': 1, 'name': 'Ferrari GT'}
                ]
                },
            ]
            },
            {
                'id': 3, 'name': 'Report 3', 'fences': [
                {
                    'id': 1, 'name': 'Fence Al', 'vehicles': [
                    {'id': 1, 'name': 'bmw m3'},
                    {'id': 1, 'name': 'Nissan'},
                    {'id': 1, 'name': 'Ferrari'}
                ]
                },
                {
                    'id': 1, 'name': 'Fence random', 'vehicles': [
                    {'id': 1, 'name': 'Ford Mustang'},
                    {'id': 1, 'name': 'Porsh Cerrare'},
                    {'id': 1, 'name': 'Ferrari GT'}
                ]
                },
            ]
            },
            {
                'id': 4, 'name': 'Report 4', 'fences': [
                {
                    'id': 1, 'name': 'Fence 24', 'vehicles': [
                    {'id': 1, 'name': 'Nissan'},
                    {'id': 1, 'name': 'bmw m3'},
                    {'id': 1, 'name': 'Porsh Cerrare'},
                    {'id': 1, 'name': 'Porsh Cerrare M3'},
                    {'id': 1, 'name': 'Ferrari'}
                ]
                },
                {
                    'id': 1, 'name': 'new Fence', 'vehicles': [
                    {'id': 1, 'name': 'bmw m3'},
                    {'id': 1, 'name': 'Ford Mustang'},
                    {'id': 1, 'name': 'Porsh Cerrare'},
                    {'id': 1, 'name': 'Ferrari GT'}
                ]
                },
            ]
            },
        ];

        vm.setReport = function (rep) {
            vm.currRep = rep;
            //vm.currFence = vm.currRep.fences[0];
        };


        vm.setSort = function (id, str) {
            // if (id == vm.tableSort.id) {
            //     if (vm.tableSort.reverse) {
            //         vm.tableSort = {'id': id, 'str': str, 'reverse': false};
            //     } else {
            //         vm.tableSort = {'id': id, 'str': '-' + str, 'reverse': true};
            //     }
            // } else {
            //     vm.tableSort = {'id': id, 'str': str, 'reverse': false};
            // }
        };

        // vm.currTable = [
        //     {
        //         'vehicleNumber': 'MH02EH1224',
        //         'event': 'Entry',
        //         'time': new Date().getTime(),
        //         'location': 'Silk Board',
        //         'deviceId': ''
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1226',
        //         'event': 'Exit',
        //         'time': new Date().getTime() + 1000,
        //         'location': 'Electronic City'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1227',
        //         'event': 'Entry',
        //         'time': new Date().getTime() + 20000,
        //         'location': 'Agaara Lake'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1229',
        //         'event': 'Exit',
        //         'time': new Date().getTime() + 30000,
        //         'location': 'Electronic City'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1230',
        //         'event': 'Entry',
        //         'time': new Date().getTime() + 50000,
        //         'location': 'Silk Board'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1231',
        //         'event': 'Exit',
        //         'time': new Date().getTime() + 1000000,
        //         'location': 'Electronic City'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1233',
        //         'event': 'Entry',
        //         'time': new Date().getTime() + 70000,
        //         'location': 'Agaara Lake'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1235',
        //         'event': 'Exit',
        //         'time': new Date().getTime() + 5000000,
        //         'location': 'Electronic City'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1236',
        //         'event': 'Entry',
        //         'time': new Date().getTime() + 1400000,
        //         'location': 'Silk Board'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1241',
        //         'event': 'Exit',
        //         'time': new Date().getTime() + 1300000,
        //         'location': 'Electronic City'
        //     },
        //     {
        //         'vehicleNumber': 'MH02EH1242',
        //         'event': 'Entry',
        //         'time': new Date().getTime() + 1200000,
        //         'location': 'Agaara Lake'
        //     }
        // ];

        google.charts.load('current', {'packages':['table']});
        google.charts.setOnLoadCallback(drawTable);

        function drawTable() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Name');
            data.addColumn('string', 'Something');
            data.addColumn('string', 'Header');
            data.addColumn('string', 'Another');
            data.addColumn('string', 'Title');
            data.addColumn('string', 'Subtitle');
            data.addColumn('string', 'Time');
            data.addColumn('string', 'Date');
            data.addColumn('number', 'Salary');
            data.addColumn('boolean', 'Employee');
            data.addRows([
                ['Mike','this is cool','Awesome','Powerful','Jonny','Distractions','10 : 30 AM','12th Amy 2016',  {v: 10000, f: '$10,000'}, true],
                ['Mohan','this is cool','Awesome','Powerful','Brad','Distractions','10 : 30 AM','12th Amy 2016',  {v: 10000, f: '$10,000'}, true],
                ['Raju','this is cool','BAwesome','Powerful','Human','Distractions','10 : 30 AM','12th Amy 2016',  {v: 10000, f: '$10,000'}, true],
                ['Kunal','this is cool','BAwesome','Powerful','Stephen','Distractions','10 : 30 AM','12th Amy 2016',  {v: 10000, f: '$10,000'}, true],
                ['Shiva','this is cool','CAwesome','Powerful','Jonny','Distractions','10 : 30 AM','12th Amy 2016',  {v: 10000, f: '$10,000'}, true],
            ]);

            var table = new google.visualization.Table(document.getElementById('geo-table'));

            table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
        }

        vm.getHistory = function (data) {
            dialogService.setData(data, 'selectedVehicle');
            dialogService.show('home.history');
        };


        vm.handleFailure = function (resp) {
            $log.log('handleFailure');
            $log.log(resp);
        };


        vm.getMyGeofenceReports = function (resp) {
            //$log.log(resp);
            vm.reports = geofenceReportService.getMyGeofenceReports();
            $log.log(vm.reports);

            vm.currRep = vm.reports[0];
            //vm.currFence = vm.currRep.fences[0];
            //vm.tableSort = {'id': 1, 'str': 'name', 'reverse': false};
        };

        vm.getMyGeofenceReportsMap = function () {
            geofenceReportService.getMyGeofenceReportsMap()
                .then(vm.getMyGeofenceReports, vm.handleFailure);
        };


        vm.init = function () {
            vm.getMyGeofenceReportsMap();
        };


        vm.init();

        vm.activePop



    }


})();
/**
 * Created by User on 22-09-2016.
 */

