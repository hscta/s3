
(function(){


    angular
        .module('uiplatform')
        .controller('DialogController', DialogController);

    function DialogController( $log, dialogService) {

        var vm = this;
        $log.log("DialogController");

        vm.getTab = function () {
            vm.selectedTab = dialogService.getTab();
            // return dialogService.getTab();
        }

        vm.closeTab = function(){
            dialogService.hide();
        }

        vm.dialogShow = function () {
            return dialogService.getDialogShow();
        }

        vm.setTab = function(tabIndex) {
            vm.selectedTab = tabIndex;
            $log.log(tabIndex);
        };

        vm.init = function() {
            dialogService.addSetTabListener(vm.setTab);
        };

        vm.init();
    }

})();

/**
 * Created by User on 24-09-2016.
 */
