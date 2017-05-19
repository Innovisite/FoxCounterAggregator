/**
 * @class MenuToggle
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for menu toggle
 **/
angular.module('FSCounterAggregatorApp').
    directive('fcaMenuToggle', function () {
        return {
            scope: {
                title: '@',
                titleIcon: '@'
            },
            transclude: true,
            controller: [
                '$scope',
                function (
                    $scope) {

                    $scope.opened = false;

                    $scope.toggle = () => {
                        $scope.opened = !$scope.opened;
                    };

                }],
            templateUrl: 'build/html/MenuToggleView.html'
        };
    });
