/**
 * Created by smiddela on 17/08/16.
 */

(function() {
    angular
        .module('uiplatform')
        .factory('stateService', stateService);

    function stateService($log, groupService) {
        var VEHICLE = 'vehicle';
        var GROUP = 'group';
        var USER = 'user';
        var ROLE = 'role';
        var DEVICE = 'device';


        var DOT = '.';
        var STATE_HOME = "home";
        var STATE_HOME_DASHBOARD = "home.dashboard";
        var STATE_HOME_MANAGEMENT = "home.management";

        var STATE_HOME_DOT = STATE_HOME + DOT;
        var STATE_HOME_DASHBOARD_DOT = STATE_HOME_DASHBOARD + DOT;
        var STATE_HOME_MANAGEMENT_DOT = STATE_HOME_MANAGEMENT + DOT;


        var getLeafState = function (absoluteState) {
            if (absoluteState === null)
                return null;

            var startIndex = absoluteState.lastIndexOf('.');
            if (startIndex == -1) {
                return absoluteState;
            }

            return absoluteState.substring(startIndex + 1);
        };


        var getParentState = function(absoluteState) {
            if (absoluteState === null)
                return null;

            var endIndex = absoluteState.lastIndexOf('.');
            if (endIndex == -1) {
                return absoluteState;
            }

            return absoluteState.substring(0, endIndex);
        };


        var getRootState = function(absoluteState) {
            if (absoluteState === null)
                return null;

            var endIndex = absoluteState.indexOf('.');
            if (endIndex == -1) {
                return absoluteState;
            }

            return absoluteState.substring(0, endIndex);
        };


        var getRootChildState = function(absoluteState) {
            if (absoluteState === null)
                return null;


            var startIndex = absoluteState.indexOf('.');
            if (startIndex == -1) {
                return absoluteState;
            } else if(startIndex == absoluteState.length - 1) {
                return null;
            }

            var endIndex = absoluteState.indexOf('.', startIndex + 1);
            if(endIndex == -1) {
                return absoluteState.substring(startIndex, absoluteState.length);
            }

            return absoluteState.substring(0, endIndex);
        };


        var getStateTree = function(absoluteState) {
            $log.log("return getStateTree");
            return {
                leaf: getLeafState(absoluteState),
                parent: getParentState(absoluteState),
                root: getRootState(absoluteState),
                rootchild: getRootChildState(absoluteState)
            }
        };


        var getData = function(info, state) {
            $log.log("stateService: getData");
            if(info === undefined)
                return;
            if(info.ui_asset_type == GROUP) {
                return groupService.getMyDirectAssetsMap({group: {grouppath: info.grouppath}});
            }
        };


        return {
            STATE_HOME : STATE_HOME,
            STATE_HOME_DASHBOARD : STATE_HOME_DASHBOARD,
            STATE_HOME_MANAGEMENT : STATE_HOME_MANAGEMENT,
            STATE_HOME_DOT : STATE_HOME_DOT,
            STATE_HOME_DASHBOARD_DOT : STATE_HOME_DASHBOARD_DOT,
            STATE_HOME_MANAGEMENT_DOT : STATE_HOME_MANAGEMENT_DOT,
            getStateTree : getStateTree,
            getData : getData,

        }
    }

})();
