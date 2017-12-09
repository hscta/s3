(function(){


    angular
        .module('uiplatform')
        .controller('LoginController', LoginController);

    function LoginController($scope, $rootScope, $log, 
		$state, ffaService) {

        $log.log('LoginController');
        var vm = this;
     

		vm.login = function () {
			if ( !vm.username || !vm.passwd){
				return;
			}
			
			if ( vm.username == "admin" ) {
				if ( vm.passwd="admin") {
					$log.log('admin');
					$state.go('admin');
				}
			}
			
			$log.log(ffaService.users);
			
			var users = ffaService.users;
			
			for ( var idx in users ) {
				if(users[idx].username === vm.username ) {
					if ( users[idx].role == "customer" ){
						$state.go('customer');
						return;
					}
					
					if ( users[idx].role == "customer" ){
						ffaService.selectedTech = users[idx];
						$state.go('customer');
						return;
					}
					
					if ( users[idx].role == "dealer" ){
						ffaService.selectedTech = users[idx];
						$state.go('dealer');
						return;
					}
					
					if ( users[idx].role == "technician" ){
						ffaService.selectedTech = users[idx];
						$state.go('technician');
						return;
					}
				}
			};
			
			$log.log('success login');
			//$state.go('admin');
		};
        //$scope.$on('toggleLeftSidebar', vm.toggleLeftSidebar);


        //To periodically check if the token is valid
        // vm.isLoginTokenValid = function() {
        //     //$log.log("isLoginTokenVaild");
        //     $interval(intellicarAPI.requestService.isLoginTokenValid, 5000);
        // }
        //
        // vm.isLoginTokenValid();
    }



    /*
     *  Jquery code for fixing resolution problem of map
     *
     * */

    // var headerAutoHide = false;


    // var headerYVal = 80;
    // var wh = $(window).height();

    // $(document).mousemove(function(event){
    //     if(headerAutoHide) {
    //         if (event.pageY < headerYVal) {
    //             // showHeader();
    //             headerYVal = 150;
    //         } else {
    //             hideHeader();
    //             headerYVal = 80;
    //         }
    //     }
    // });

    // function hideHeader() {
    //     $('.mainHeader').css({'margin-top':'-45px'});
    // }

    // function showHeader() {
    //     $('.mainHeader').css({'margin-top':'0'});
    // }

})();
