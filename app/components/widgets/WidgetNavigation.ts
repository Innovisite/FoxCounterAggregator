
declare const angular: any;

interface SiteItem {
    _id: string;
    items?: SiteItem[];
    name: string;
}

interface ThreeNode {
    name: string;
    path: string;
    parent: ThreeNode;
    childs: ThreeNode[];
}

angular.module('FSCounterAggregatorApp').
    directive('fcaWidgetNavigation', function () {
        return {
            scope: {
                params: '=',
                onNextSite: '&'
            },
            controller: [
                '$scope',
                function (
                    $scope: any
                ) {

                    $scope.three = {
                        name: "All",
                        path: "",
                        parent: undefined,
                        childs: []
                    };
                
                    $scope.threePos = this.three;
                    $scope.navPos = this.threePos;

                    $scope.$watch("params.sites", function (newSites: any, oldSites: any) {                                              

                        if (newSites !== undefined && newSites.length) {
                            $scope.updateTree(newSites);
                        }

                    });

                    $scope.updateTree = function(sites: SiteItem[]) {

                        function fill_tree_rec(threePos: ThreeNode, sites: SiteItem[]) {
                            sites.filter(s => s.items && s.items.length).forEach(site => {
                                const child: ThreeNode = {
                                    name: site.name,
                                    path: threePos.path.length ? threePos.path + "/" + site._id : site._id,
                                    parent: threePos,
                                    childs: []
                                };
                                fill_tree_rec(child, site.items);
                                threePos.childs.push(child);
                            });
                        }

                        $scope.three.childs = [];
                        $scope.threePos = this.three;                        
                        fill_tree_rec($scope.threePos, sites);
                    };

                    $scope.navParent = function($event: Event) {
                        $event.stopPropagation();                        
                        if($scope.navPos.parent) {
                            $scope.navPos = $scope.navPos.parent;
                        }
                    };

                    $scope.navChild = function($event: Event, child: ThreeNode) {
                        $event.stopPropagation();                        
                        $scope.navPos = child;
                    };

                    $scope.initNav = function() {
                        $scope.navPos = $scope.threePos;
                    };

                    $scope.goNav = function(item: ThreeNode) {
                        $scope.threePos = item;
                        $scope.onNextSite({$event: item});
                    };

                }],
            templateUrl: "build/html/WidgetContainerView.html"
        };
    });
