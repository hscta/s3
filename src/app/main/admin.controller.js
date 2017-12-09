(function(){


    angular
        .module('uiplatform')
        .controller('AdminController', AdminController);

    function AdminController($scope, $rootScope, $log, $mdDialog,
						ffaService, $mdSidenav) {

        $log.log('AdminController');
        var vm = this;
		
		vm.users = ffaService.users;

		 $scope.customFullscreen = false;
		 
		$scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }
		 
		vm.username = null;
		vm.role = null;
		
		
		 
		vm.addUser = function () {
			if ( vm.username && vm.role) 
				ffaService.users.push({username:vm.username, role:vm.role});
			vm.username = null;
			vm.role = null;
		};
        
		$log.log(ffaService.users);
		vm.roles = ['dealer', 'technician'];
		
		vm.ticketDetails = [{
			id:1,
			date:"1 Nov 2017",
			customerName : "client1",
			city: "Bangalore",
			pincode:"560029",
			status:"open"
			},
			{
			id:2,
			date:"2 Nov 2017",
			customerName : "client2",
			city: "Bangalore",
			pincode:"560001",
			status:"Assigned"
			},
			{
			id:3,
			date:"3 Nov 2017",
			customerName : "client3",
			city: "Bangalore",
			pincode:"560002",
			status:"open"
			}
			
		];
		
		vm.addTicket = function (ev) {
			$mdDialog.show({
			  controller: DialogController,
			  templateUrl: 'app/main/add_ticket.html',
			  parent: angular.element(document.body),
			  targetEvent: ev,
			  clickOutsideToClose:true,
			  fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer) {
				$scope.status = 'You said the information was "' + answer + '".';
			}, function() {
				$scope.status = 'You cancelled the dialog.';
			});
		};
		
		
		vm.addUsers = function () {
		
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
    }

})();
