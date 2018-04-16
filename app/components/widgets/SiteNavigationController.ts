import { SiteItem, SiteNavItem, SITE_NAV_EMPTY_ROOT } from "../types/site";

/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope: any, $controller: any, $paramsService: any) {

    this.params = undefined;
    this.three = Object.assign({}, SITE_NAV_EMPTY_ROOT);
    this.threePos = this.three;
    this.originalSites = undefined;
    this.originalData = undefined;
    this.originalCompData = undefined;

    const that = this;

    $scope.init = function (params: any) {

        that.params = Object.assign({}, params);

        $scope.$watch("params.sites", function (newSites: any[], oldSites: any[]) {
            if (newSites !== undefined && newSites.length) {
                that.originalSites = newSites.slice(0);
                that.params.sites = that.originalSites;
                that.updateTree(newSites);
            } else {
                that.params.sites = newSites;
            }
        });

        $scope.$watch('params.data', function (newData: any[], oldData: any[]) {
            if (newData !== undefined && newData.length) {
                that.originalData = newData.slice(0);
                that.params.data = that.originalData;
            } else {
                that.params.data = newData;
            }
        });

        $scope.$watch('params.comparedData', function (newData: any[], oldData: any[]) {
            if (newData != undefined && newData.length) {
                that.originalCompData = newData.slice(0);
                that.params.comparedData = that.originalCompData;
            } else {
                that.params.comparedData = newData;
            }
        });

        return that.params;
    };

    this.goNav = function ($event: SiteNavItem) {

        if ($event.path.length) {
            let subPart = { items: this.originalSites };
            $event.path.split("/")
                .forEach(elt => {
                    subPart = subPart.items.find((item: SiteItem) => (item.id == elt) || (item._id == elt));
                });
            // fab: TODO replace/add id with _id everywhere in order to simplify services APIs
            this.params.sites = subPart.items.map((site: SiteItem) => Object.assign(site, { id: site._id }));
        } else {
            this.params.sites = this.originalSites;
        }

        $paramsService.loadDataForSites(this.params.sites)
            .then((res: any[]) => {
                this.params.data = res[0];
                if (res[1]) {
                    this.params.comparedData = res[1];
                }
            });

        this.threePos = $event;
    };

    this.goUp = function() {

        if(this.threePos.parent) {
            this.threePos = this.threePos.parent;
        }

    };

    this.goChildFromId = function(id: string) {        
        
        const path = this.threePos.path.length ? this.threePos.path + "/" + id : id;
        const child: SiteNavItem = (<SiteNavItem> this.threePos).childs.find(c => c.path == path);

        if(child) {
            this.goNav(child);
        }

    };    

    this.updateTree = function (sites: SiteItem[]) {

        function fill_tree_rec(threePos: SiteNavItem, sites: SiteItem[]) {
            sites.filter(s => s.items && s.items.length).forEach(site => {
                const child: SiteNavItem = {
                    name: site.name,
                    path: threePos.path.length ? threePos.path + "/" + site._id : site._id,
                    parent: threePos,
                    childs: []
                };
                fill_tree_rec(child, site.items);
                threePos.childs.push(child);
            });
        }

        this.three.childs = [];
        this.threePos = this.three;
        fill_tree_rec(this.threePos, sites);
    };

}

(<any>SiteNavigationController).$inject = ["$scope", "$controller", "DashboardParamsService"];

export = SiteNavigationController;
