/**
 * Created by smiddela on 02/10/16.
 */


(function () {
    'use strict';

    angular.module('uiplatform')
        .service('ffaService', ffaService);

    function ffaService($log, $q, requestService, helperService) {
        var vm = this;
        $log.log("ffaService");
		
		vm.ticketList = [];
		
		vm.status = ['Open', 'Assigned', 'Closed'];
		
		vm.roles = ['customer', 'dealer', 'technician'];
		vm.users = [{
			username : 'user1',
			role: 'customer'
		}];

    }

})();