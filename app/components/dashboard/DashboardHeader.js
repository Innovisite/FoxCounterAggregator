/**
 * @class DashboardHeader
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying top bar header with controls for dashboard pages
 **/
angular.module('FSCounterAggregatorApp').
    directive('fcaDashboardHeader', function () {
        return {
            scope: {
                params: '=',
                title: '@',
                titleIcon: '@',
                signal_timezone: '&onTimeZone'
            },
            link: function (scope, element, attr) {
            },
            templateUrl: 'build/html/DashboardHeaderView.html'
        };
    });
