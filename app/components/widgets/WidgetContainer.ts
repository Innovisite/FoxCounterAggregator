
declare const angular: any;

interface SiteItem {
    id: string;
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
    directive('fcaWidgetContainer', function () {
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
                                    path: threePos.path + "/" + site.id,
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

                    $scope.goParent = function($event: Event) {
                        $event.stopPropagation();                        
                        if($scope.threePos.parent) {
                            $scope.threePos = $scope.threePos.parent;
                        }
                    };

                    $scope.goChild = function($event: Event, child: ThreeNode) {
                        $event.stopPropagation();                        
                        $scope.threePos = child;
                    };

                }],
            templateUrl: "build/html/WidgetContainerView.html"
        };
    });

/* class WidgetContainerImpl {

    static $inject = ["$scope"];

    onNextSite: Function;

    three: ThreeNode = {
        name: "All",
        path: "",
        parent: undefined,
        childs: []
    };

    threePos: ThreeNode = this.three;

    params: any;

    constructor(private $scope: any) {        

        debugger

        $scope.getChildren = function (params: any) {
            debugger
            return params;
        };

        $scope.$watch("params.sites", function (newSites: any, oldSites: any) {

            debugger

            if (newSites !== undefined && newSites.length) {
                this.updateTree(newSites);
            }

        });

    }

    $onInit(): void {        
        debugger

        console.log(this.$scope);
    }

    $onChanges(changesObj: any) {
        debugger
    }

    detectChange() {
        debugger
    }

    goNextSite() {
        this.onNextSite();
    }

    updateTree(sites: SiteItem[]) {

        debugger

        this.three.childs = [];
        this.threePos = this.three;
        this.fill_tree_rec(this.threePos, sites);
    }

    private fill_tree_rec(threePos: ThreeNode, sites: SiteItem[]) {
        sites.filter(s => s.items && s.items.length).forEach(site => {
            const child: ThreeNode = {
                name: site.name,
                path: threePos.path + "/" + site.id,
                parent: threePos,
                childs: []
            };
            this.fill_tree_rec(child, site.items);
            threePos.childs.push(child);
        });
    }
}


class WidgetContainer {

    bindings: any = {
        params: '=',
        onNextSite: '&'
    };
    controller = WidgetContainerImpl;
    templateUrl = "build/html/WidgetContainerView.html";
    transclude = true;

    constructor() {

    }

}

export = WidgetContainer; */