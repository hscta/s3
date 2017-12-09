(function(){


    angular
        .module('uiplatform')
        .controller('BranchController', BranchController);

    function BranchController($scope, $rootScope, $log, $mdDialog,
						ffaService) {

        $log.log('AdminController2');
        var vm = this;
		$scope.customFullscreen = false;
	 
		vm.users = ffaService.users;
		
		vm.ticketList = ffaService.ticketList;
		vm.statusList = ffaService.status;
		vm.priorityLIst = ffaService.priority;
		vm.status = vm.statusList[0];
		
		vm.init = function () {
			vm.resetForm();
		};

		vm.addUser = function () {
			if ( vm.username && vm.role) 
				ffaService.users.push({username:vm.username, role:vm.role});
			vm.username = null;
			vm.role = null;
		};
        
		$log.log(ffaService.users);
	
		vm.resetForm = function () {			
			vm.customerName = null;
			vm.contactPerson = null;
			vm.city = null;
			vm.pincode = null;
			vm.issue = null;
			vm.status = null;
			vm.customerNameErr = null;
			vm.contactPersonErr = null;
			vm.cityErr = null;
			vm.pincodeErr = null;
			vm.priorityErr = null;
			vm.statusErr = null;
			
		};
		
		
		vm.createTicket = function () {
			$log.log('create ticket');
			if ( vm.customerName == null ) {
				vm.customerNameErr = "This field required."
				return;
			}
			
			if ( vm.contactPerson == null ) {
				vm.contactPersonErr = "This field required."
				return;
			}
			if ( vm.city == null ) {
				vm.cityErr = " This field required."
				return;
			}
			
			if ( vm.pincode == null ) {
				vm.pincodeErr = "This field required."
				return;
			}
			
			if ( vm.issue == null ) {
				vm.priorityErr = " This field required."
				return;
			}
			
			if ( vm.status == null ) {
				vm.statusErr = "This field required."
				return;
			}
			
			var id = ffaService.ticketList.length;
			
			ffaService.ticketList.push({
				customerName : vm.customerName,
				contactPerson : vm.contactPerson,
				city : vm.city,
				pincode : vm.pincode,
				issue : vm.issue,
				status: vm.status,
				id : id,
				assignedTo : ''
			});
			vm.resetForm();
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
