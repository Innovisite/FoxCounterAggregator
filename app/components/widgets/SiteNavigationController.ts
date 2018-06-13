import { SiteItem, SiteNavItem, SITE_NAV_EMPTY_ROOT, ViewableNode } from "../types/site";
import { DataItem, QueryPeriod } from "../types/data";
import { DashboardParamsService } from '../services/DashboardParamsService';

/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope: any, $controller: any, $paramsService: DashboardParamsService) {

    this.params = { sites: [], data: [] };
    this.three = Object.assign({}, SITE_NAV_EMPTY_ROOT);
    this.threePos = this.three;
    this.originalSites = undefined;

    const that = this;

    $scope.init = function (params: any) {

        that.params = Object.assign({}, params);

        $scope.$watch("params.sitesWithChilds", function (newSites: ViewableNode[], oldSites: ViewableNode[]) {            
            if (newSites !== undefined && newSites.length) {
                that.originalSites = newSites.slice(0).map((site: ViewableNode) => Object.assign({}, site, {
                    haveItems: newSites.find((s: ViewableNode) => s.parent_id == site.id) != null
                }));
                that.params.sites = that.originalSites.filter((site: ViewableNode) => !site.parent_id);                  
                that.createSitesTree(newSites);
            }
        });

        $scope.$watch('params.data', function (newData: DataItem[], oldData: DataItem[]) {
            if (newData !== undefined && newData.length) {
                that.goNav(that.threePos);
            }
        });

        $scope.$watch('params.comparedData', function (newData: DataItem[], oldData: DataItem[]) {
            if (newData == undefined) {
                that.params.comparedData = undefined;
            }
        });

        $scope.$watch('params.period', function (newData: QueryPeriod, oldData: QueryPeriod) {
            if (newData !== undefined) {
                that.params.period = newData;
            }
        });

        $scope.$watch('params.comparedPeriod', function (newData: QueryPeriod, oldData: QueryPeriod) {
            if (newData !== undefined) {
                that.params.comparedPeriod = newData;
            }
        });

        return that.params;
    };

    this.goNav = function (nav: SiteNavItem|ViewableNode) {        

        this.params.sites = that.originalSites.filter((site: ViewableNode) => site.parent_id == nav.id);

        this.uploadData();

        this.threePos = nav;
    };

    this.uploadData = function () {
        $paramsService.loadDataForSites(this.params.sites)
            .then((res: any[]) => {
                this.params.data = res[0];
                if (res[1]) {
                    this.params.comparedData = res[1];
                }
            });
    };

    this.goUp = function () {

        if (this.threePos.parent) {
            this.threePos = this.threePos.parent;
        }

    };

    this.goChildFromId = function (id: string) {

        const child: SiteNavItem = (<SiteNavItem>this.threePos).childs.find(c => c.id == id);

        if (child) {
            this.goNav(child);
        }

    };

    this.createSitesTree = function (items: ViewableNode[]) {

        const wrapViewableNode = (threePos: SiteNavItem, vn: ViewableNode): SiteNavItem => {
            return {
                id: vn.id,
                name: vn.display_name,
                path: threePos.path.length ? threePos.path + "/" + vn.id : vn.id,
                parent: threePos,
                childs: []
            };
        };

        const createItemsRec = (curNode: SiteNavItem, items: ViewableNode[]): SiteNavItem => {
            // here is the side effect, we need to update curNode childs in order
            // to propagate the childs information the parent pt
            return Object.assign(curNode, {
                childs: items.filter(item => item.parent_id == curNode.id)
                    .map(vn => wrapViewableNode(curNode, vn))
                    .map(node => createItemsRec(node, items))
            });
        }

        this.three.childs = items
            .filter(item => !item.parent_id)
            .map(vn => wrapViewableNode(this.three, vn))
            .map(node => createItemsRec(node, items));
        this.threePos = this.three;
    };

}

(<any>SiteNavigationController).$inject = ["$scope", "$controller", "DashboardParamsService"];

export = SiteNavigationController;
