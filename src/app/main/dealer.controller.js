(function(){


    angular
        .module('uiplatform')
        .controller('DealerController', DealerController);

    function DealerController($scope, $rootScope, $log, $mdDialog,
						ffaService) {

        $log.log('DealerController');
        var vm = this;
		$scope.customFullscreen = false;
	 
		vm.users = ffaService.users;
		
		vm.ticketList = ffaService.ticketList;
		vm.statusList = ffaService.status;
		vm.priorityLIst = ffaService.priority;
		vm.status = vm.statusList[0];
		
		$log.log(vm.ticketList);
		vm.init = function () {
			vm.users = ffaService.users;
			
			vm.technicians = [];
			
			for ( var idx in vm.users ) {
				if ( vm.users[idx].role === ffaService.roles[2]){
					vm.technicians.push(vm.users[idx]);
				}
			}
		};
		
		$log.log(ffaService.users);
	
	
		vm.assignTicket = function (ticket, index) {
			console.log('sdfsdf');
			$log.log(ticket);
			
			console.log(ticket.assignedTo);
			if ( ticket.assignedTo ) {
				for ( var idx in vm.ticketList){
					console.log(vm.ticketList[idx].id, ticket.id);
					if ( parseInt(vm.ticketList[idx].id) === parseInt(ticket.id)){
						console.log(vm.ticketList);
						vm.ticketList[idx].status = "Assigned";						
					}
				}
			}
		};
		
		 function DialogController($scope, $mdDialog) {
			$scope.hide = function() {
			  $mdDialog.hide();
			};

			$scope.cancel = function() {
			  $mdDialog.cancel();
			};

			$scope.answer = function(answer) {
			  $mdDialog.hide(answer);
			};
		  }

        //To periodically check if the token is valid
        // vm.isLoginTokenValid = function() {
        //     //$log.log("isLoginTokenVaild");
        //     $interval(intellicarAPI.requestService.isLoginTokenValid, 5000);
        // }
        //
        // vm.isLoginTokenValid();
		
		vm.init();
    }

})();
