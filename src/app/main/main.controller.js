(function(){


    angular
        .module('uiplatform')
        .controller('MainController', MainController);

    function MainController( $scope,$rootScope, navService, $mdSidenav, $mdBottomSheet, $log, $q, $state,
                            $mdToast, $document, loginService, requestService) {

        $log.log('MainController');
        var vm = this;
        vm.dummy = false;

        vm.toggleLeftnav = function(event, data) {
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftnav', vm.toggleLeftnav);

        // $rootScope.$on('$viewContentLoading',
        //     function(event, viewConfig) {
        //         // Access to all the view config properties.
        //         // and one special property 'targetView'
        //         // viewConfig.targetView
        //         $log.log("$viewContentLoading");
        //         $rootScope.$emit('getLeftnavData', {'getLeftnavEvent': true});
        //     });

        // vm.menuItems = [ ];
        // vm.selectItem = selectItem;
        // vm.toggleItemsList = toggleItemsList;
        // vm.showActions = showActions;
        // //vm.title = $state.current.data.title;
        // vm.showSimpleToast = showSimpleToast;
        // vm.toggleRightSidebar = toggleRightSidebar;
        //
        // navService
        //     .loadAllItems()
        //     .then(function(menuItems) {
        //         vm.menuItems = [].concat(menuItems);
        //     });
        //
        // function toggleRightSidebar() {
        //     $mdSidenav('right').toggle();
        // }
        //
        // function toggleItemsList() {
        //     var pending = $mdBottomSheet.hide() || $q.when(true);
        //
        //     pending.then(function(){
        //         $mdSidenav('left').toggle();
        //     });
        // }
        //
        // function selectItem (item) {
        //     vm.title = item.name;
        //     vm.toggleItemsList();
        //     vm.showSimpleToast(vm.title);
        // }
        //
        // function showActions($event) {
        //     $mdBottomSheet.show({
        //         //parent: angular.element(document.getElementById('content')),
        //         parent: $document.getElementById('content'),
        //         templateUrl: 'app/main/bottomSheet.html',
        //         controller: [ '$mdBottomSheet', SheetController],
        //         controllerAs: "vm",
        //         bindToController : true,
        //         targetEvent: $event
        //     }).then(function(clickedItem) {
        //         clickedItem && $log.debug( clickedItem.name + ' clicked!');
        //     });
        //
        //     function SheetController( $mdBottomSheet ) {
        //         var vm = this;
        //
        //         vm.actions = [
        //             { name: 'Share', icon: 'share', url: 'https://twitter.com/intent/tweet?text=Angular%20Material%20Dashboard%20https://github.com/flatlogic/angular-material-dashboard%20via%20@flatlogicinc' },
        //             { name: 'Star', icon: 'star', url: 'https://github.com/flatlogic/angular-material-dashboard/stargazers' }
        //         ];
        //
        //         vm.performAction = function(action) {
        //             $mdBottomSheet.hide(action);
        //         };
        //     }
        // }
        //
        // function showSimpleToast(title) {
        //     $mdToast.show(
        //         $mdToast.simple()
        //             .content(title)
        //             .hideDelay(2000)
        //             .position('bottom right')
        //     );
        // }

        // vm.checkLogin = function() {
        //     if(!loginService.isAuthed()) {
        //         loginService.checkLogin();
        //     }
        // }
        //
        // vm.checkLogin();
    }

})();
