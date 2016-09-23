

(function(){


    angular
        .module('uiplatform')
        .controller('GeofenceController', GeofenceController);

    function GeofenceController($scope, $rootScope, $log, mapService,
                                $timeout, $mdDialog, $document, $interval,
                                rightNavAlertDashboardService,MapLeftToolBarService, historyService) {

        var vm = this;

        vm.reports = [
            {'id':1,'name':'Report 1', 'fences':[
                {'id':1,'name':'Fence 1', 'vehicles':[
                    {'id':1,'name':'bmw m3'},
                    {'id':1,'name':'Nissan'},
                    {'id':1,'name':'Ferrari'},
                ]},
                {'id':1,'name':'Fence 2', 'vehicles':[
                    {'id':1,'name':'Ford Mustang'},
                    {'id':1,'name':'Porsh Cerrare'},
                    {'id':1,'name':'Ferrari GT'},
                ]},
            ]},
            {'id':2,'name':'Report 2', 'fences':[
                {'id':1,'name':'Fence 4', 'vehicles':[
                    {'id':1,'name':'Nissan'},
                    {'id':1,'name':'bmw m3'},
                    {'id':1,'name':'Porsh Cerrare'},
                    {'id':1,'name':'Porsh Cerrare M3'},
                    {'id':1,'name':'Ferrari'},
                ]},
                {'id':1,'name':'Fence 5', 'vehicles':[
                    {'id':1,'name':'bmw m3'},
                    {'id':1,'name':'Ford Mustang'},
                    {'id':1,'name':'Porsh Cerrare'},
                    {'id':1,'name':'Ferrari GT'},
                ]},
            ]},
            {'id':3,'name':'Report 3', 'fences':[
                {'id':1,'name':'Fence Al', 'vehicles':[
                    {'id':1,'name':'bmw m3'},
                    {'id':1,'name':'Nissan'},
                    {'id':1,'name':'Ferrari'},
                ]},
                {'id':1,'name':'Fence random', 'vehicles':[
                    {'id':1,'name':'Ford Mustang'},
                    {'id':1,'name':'Porsh Cerrare'},
                    {'id':1,'name':'Ferrari GT'},
                ]},
            ]},
            {'id':4,'name':'Report 4', 'fences':[
                {'id':1,'name':'Fence 24', 'vehicles':[
                    {'id':1,'name':'Nissan'},
                    {'id':1,'name':'bmw m3'},
                    {'id':1,'name':'Porsh Cerrare'},
                    {'id':1,'name':'Porsh Cerrare M3'},
                    {'id':1,'name':'Ferrari'},
                ]},
                {'id':1,'name':'new Fence', 'vehicles':[
                    {'id':1,'name':'bmw m3'},
                    {'id':1,'name':'Ford Mustang'},
                    {'id':1,'name':'Porsh Cerrare'},
                    {'id':1,'name':'Ferrari GT'},
                ]},
            ]},
        ];

        vm.currRep = vm.reports[0];
        vm.currFence = vm.currRep.fences[0];

        console.log(vm.currRep.fences[0]);

        vm.setReport = function (rep) {
            vm.currRep = rep;
            vm.currFence = vm.currRep.fences[0];
            console.log(vm.currFence);
        }

        vm.tableSort = {'id':1,'str':'name','reverse':false};

        vm.setSort = function (id,str) {
          if(id == vm.tableSort.id){
              if(vm.tableSort.reverse){
                  vm.tableSort = {'id':id,'str':str,'reverse':false};
              }else{
                  vm.tableSort = {'id':id,'str':'-'+str,'reverse':true};
              }
          }else{
              vm.tableSort = {'id':id,'str':str,'reverse':false};
          }
          console.log(vm.tableSort);
        };

        vm.currTable = [
            {'name':'KL123AS', 'event':'Entry', 'time': new Date().getTime(), 'location':'Silk Board'},
            {'name':'KN23PQS', 'event':'Exit', 'time': new Date().getTime()+1000 , 'location':'Electronic City'},
            {'name':'KL123AS', 'event':'Entry', 'time': new Date().getTime()+20000, 'location':'Agaara Lake'},
            {'name':'KN23PQS', 'event':'Exit', 'time': new Date().getTime()+30000, 'location':'Electronic City'},
            {'name':'KL123AS', 'event':'Entry', 'time': new Date().getTime()+50000, 'location':'Silk Board'},
            {'name':'KN23PQS', 'event':'Exit', 'time': new Date().getTime()+1000000, 'location':'Electronic City'},
            {'name':'KL123AS', 'event':'Entry', 'time': new Date().getTime()+70000, 'location':'Agaara Lake'},
            {'name':'KN23PQS', 'event':'Exit', 'time': new Date().getTime()+5000000, 'location':'Electronic City'},
            {'name':'KL123AS', 'event':'Entry', 'time': new Date().getTime()+1400000, 'location':'Silk Board'},
            {'name':'KN23PQS', 'event':'Exit', 'time': new Date().getTime()+1300000, 'location':'Electronic City'},
            {'name':'KL123AS', 'event':'Entry', 'time': new Date().getTime()+1200000, 'location':'Agaara Lake'},
        ]

        vm.getHistory = function (tr) {
            console.log(tr);

            historyService.setData('selectedTab', 0);
            console.log(historyService.getData('selectedTab'));
        }

    }

    console.log(new Date().getTime());

})();

/**
 * Created by User on 22-09-2016.
 */
