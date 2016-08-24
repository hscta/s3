/**
 * Created by smiddela on 21/08/16.
 */


(function() {

    angular
        .module('uiplatform')
    .service('anchorSmoothScroll', function(){

        this.scrollTo = function(eID) {
                // This scrolling function
            // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

            var startY = currentYPosition();
            var stopY = elmYPosition(eID);
            var distance = stopY > startY ? stopY - startY : startY - stopY;
            if (distance < 100) {
                scrollTo(0, stopY); return;
            }
            var speed = Math.round(distance / 100);
            if (speed >= 20) speed = 20;
            var step = Math.round(distance / 25);
            var leapY = stopY > startY ? startY + step : startY - step;
            var timer = 0;
            if (stopY > startY) {
                for ( var i=startY; i<stopY; i+=step ) {
                    setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                    leapY += step; if (leapY > stopY) leapY = stopY; timer++;
                } return;
            }
            for ( var i=startY; i>stopY; i-=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
            }

            function currentYPosition() {
                // Firefox, Chrome, Opera, Safari
                if (self.pageYOffset) return self.pageYOffset;
                // Internet Explorer 6 - standards mode
                if (document.documentElement && document.documentElement.scrollTop)
                    return document.documentElement.scrollTop;
                // Internet Explorer 6, 7 and 8
                if (document.body.scrollTop) return document.body.scrollTop;
                return 0;
            }

            function elmYPosition(eID) {
                var elm = document.getElementById(eID);
                var y = elm.offsetTop;
                var node = elm;
                while (node.offsetParent && node.offsetParent != document.body) {
                    node = node.offsetParent;
                    y += node.offsetTop;
                } return y;
            }

        };

    })
        .controller('Tab2Controller', Tab2Controller);

    function Tab2Controller($scope, $rootScope, $log, tab2Service, $state, $location, anchorSmoothScroll) {

        $log.log('Tab2Controller');
        var vm = this;

        // $log.log('state.name = ');
        // $log.log($state);

        vm.handleMyVehicles = function(data) {
            $log.log("Tab2Controller handleMyVehicles");
            $log.log(data);

            vm.data = data;
        };

        vm.handleMyVehiclesFailure = function(data) {
            $log.log("Tab2Controller handleMyVehiclesFailure");
        };

        vm.onGroupClick = function() {
            tab2Service.getMyVehicles({group:{grouppath: '/1/1'}})
                .then(vm.handleMyVehicles, vm.handleMyVehiclesFailure);

        }

        vm.onGroupClick();

        vm.toggle_on_panel = function (myfunc) {
            $log.log('click event');
            myfunc();
        }

        vm.test = function(event, data) {
            vm.info = data.info;
            $log.log(vm.info);

            $location.hash('bottom');

            // call $anchorScroll()
            anchorSmoothScroll.scrollTo('sss');
        }

        $scope.$on('test', vm.test);

    }
})();


