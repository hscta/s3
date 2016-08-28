/**
 * Created by smiddela on 27/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .factory('constantFactory', constantFactory);

    function constantFactory() {

        return {
            GROUP: 'group',
            VEHICLE: 'vehicle',
            USER: 'user',
            ROLE: 'role',
            DEVICE: 'device'
        }
    }

})();

