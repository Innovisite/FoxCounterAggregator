declare const angular: any;

import { SiteItem, SiteNavItem } from "../types/site";

angular.module('FSCounterAggregatorApp').
    directive('fcaWidgetNavigation', function () {
        return {
            scope: {
                three: '=',
                threePos: '=',
                onNextSite: '&'
            },
            controller: [
                '$scope',
                function (
                    $scope: any
                ) {                    

                    $scope.breadCrumbs = [];
                    $scope.navPos = this.threePos;

                    $scope.$watch("threePos", function (newPos: SiteNavItem, oldPos: SiteNavItem) {

                        if (newPos !== undefined) {
                            $scope.initNav();
                            $scope.updateBreadCrumbs();
                        }

                    });

                    $scope.navParent = function ($event: Event) {
                        $event.stopPropagation();
                        if ($scope.navPos.parent) {
                            $scope.navPos = $scope.navPos.parent;
                        }
                    };

                    $scope.navChild = function ($event: Event, child: SiteNavItem) {
                        $event.stopPropagation();
                        $scope.navPos = child;
                    };

                    $scope.initNav = function () {
                        $scope.navPos = $scope.threePos;
                    };

                    $scope.goNav = function (item: SiteNavItem) {
                        $scope.onNextSite({ $event: item });
                    };

                    $scope.updateBreadCrumbs = function () {
                        const breadCrumbs: SiteNavItem[] = [];
                        for (let p = $scope.threePos; p !== undefined; p = p.parent) {
                            breadCrumbs.push(p);
                        }
                        $scope.breadCrumbs = breadCrumbs.reverse();
                    };

                }],
            templateUrl: "build/html/WidgetNavigationView.html"
        };
    });
