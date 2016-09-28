/**
 * Created by smiddela on 27/08/16.
 */

(function () {
    angular
        .module('uiplatform')
        .factory('appConstants', appConstants);

    function appConstants() {

        return {
            GROUP: 'group',
            VEHICLE: 'vehicle',
            USER: 'user',
            ROLE: 'role',
            DEVICE: 'device',
            VEHICLETYPE: 'vehicletype',
            DEVICETYPE: 'devicetype',
            FENCE: 'fence'
        }
    }

})();

