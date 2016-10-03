(function(){


    angular
        .module('uiplatform')
        .controller('MainController', MainController);

    function MainController($scope, $rootScope, $log, intellicarAPI) {

        $log.log('MainController');
        var vm = this;
        vm.dummy = false;

        vm.toggleLeftnav = function(event, data) {
            vm.dummy = data.dummy;
        }

        $scope.$on('toggleLeftnav', vm.toggleLeftnav);


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

    var headerAutoHide = false;

    var wh = $(window).height();
    var header_height = 95;
    if(headerAutoHide){
        $('.mainHeader').css({'margin-top':'-45px'});
        header_height = 50;
    }

    function setMapHeight() {

        wh = $(window).height();
        isRendered('.angular-google-map-container', function (el) {
            el.css('height', (wh - header_height) + 'px');
        });
        isRendered('.alert-md-content', function (el) {
            el.css('height', (wh - header_height) + 'px');
        });
    }

    $(window).ready(function () {
        setMapHeight();
    });


    $(window).resize(function () {
        setMapHeight();
    });

    function isRendered(el, callback) {
        var isr_interval = setInterval(function () {
            if ($(el).length > 0) {
                callback($(el));
                clearInterval(isr_interval);
            }
        }, 200)
    }



    var headerYVal = 80;
    var wh = $(window).height();

    $(document).mousemove(function(event){
        if(headerAutoHide) {
            if (event.pageY < headerYVal) {
                showHeader();
                headerYVal = 150;
            } else {
                hideHeader();
                headerYVal = 80;
            }
        }
    });

    function hideHeader() {
        $('.mainHeader').css({'margin-top':'-45px'});
    }

    function showHeader() {
        $('.mainHeader').css({'margin-top':'0'});
    }

})();
