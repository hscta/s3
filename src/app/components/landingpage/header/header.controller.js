/**
 * Created by smiddela on 12/08/16.
 */

(function(){


    angular
        .module('uiplatform')
        .controller('HeaderController', HeaderController);

    function HeaderController($rootScope, $scope, navService, $mdSidenav,$mdMenu, $mdBottomSheet, $log, $q, $state,
                            $mdToast, $document, loginService, userprefService) {

        $log.log('HeaderController');
        var vm = this;
        vm.menuItems = [ ];
        vm.selectItem = selectItem;
        vm.toggleItemsList = toggleItemsList;
        vm.showActions = showActions;
        //vm.title = $state.current.data.title;
        vm.showSimpleToast = showSimpleToast;
            // vm.toggleLeftnav = toggleLeftnav;
        // $rootScope.left_nav_toggle = true;
        // $rootScope.right_nav_toggle = true;
        vm.right_nav_toggle = true;
        vm.left_nav_toggle = true;

        vm.userpref = function() {
            return userprefService.userpref;
        };

        navService
            .loadAllItems()
            .then(function(menuItems) {
                vm.menuItems = [].concat(menuItems);
            });

        vm.changePassword = function () {

        };

        vm.logout = function () {
            loginService.logout();
        };

        vm.toggleRightSidebar = function (){
            vm.right_nav_toggle = !vm.right_nav_toggle;
            $rootScope.$broadcast('toggleRightSidebar', {'right_nav_toggle': vm.right_nav_toggle});
        };


        vm.toggleLeftSidebar = function() {
            $log.log('left nav header');
            vm.left_nav_toggle = !vm.left_nav_toggle;
            $rootScope.$broadcast('toggleLeftSidebar', {'left_nav_toggle': vm.left_nav_toggle});
        }

        function toggleItemsList() {
            var pending = $mdBottomSheet.hide() || $q.when(true);

            pending.then(function(){
                $mdSidenav('left').toggle();
            });
        }

        function selectItem (item) {
            vm.title = item.name;
            vm.toggleItemsList();
            vm.showSimpleToast(vm.title);
        }

        function showActions($event) {
            $mdBottomSheet.show({
                //parent: angular.element(document.getElementById('content')),
                parent: $document.getElementById('content'),
                templateUrl: 'app/main/bottomSheet.html',
                controller: [ '$mdBottomSheet', SheetController],
                controllerAs: "vm",
                bindToController : true,
                targetEvent: $event
            }).then(function(clickedItem) {
                clickedItem && $log.debug( clickedItem.name + ' clicked!');
            });

            function SheetController( $mdBottomSheet ) {
                var vm = this;

                vm.actions = [
                    { name: 'Share', icon: 'share', url: 'https://twitter.com/intent/tweet?text=Angular%20Material%20Dashboard%20https://github.com/flatlogic/angular-material-dashboard%20via%20@flatlogicinc' },
                    { name: 'Star', icon: 'star', url: 'https://github.com/flatlogic/angular-material-dashboard/stargazers' }
                ];

                vm.performAction = function(action) {
                    $mdBottomSheet.hide(action);
                };
            }
        }

        function showSimpleToast(title) {
            $mdToast.show(
                $mdToast.simple()
                    .content(title)
                    .hideDelay(2000)
                    .position('bottom right')
            );
        }

        vm.closeMdMenu = function(e){
            if(e.keyCode == 27){
                $mdMenu.hide()
            }
        }

    }

})();

