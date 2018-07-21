import { SiteNavItem, SITE_NAV_EMPTY_ROOT, ViewableNode } from "../types/site";
import { DataItem, QueryPeriod } from "../types/data";
import { DashboardParamsService, DashboardParams } from '../services/DashboardParamsService';

declare const angular: any;

/**
 * @class SiteNavigationController
 * @memberOf FSCounterAggregatorApp
 */
function SiteNavigationController($scope: any, $controller: any, $paramsService: DashboardParamsService) {

    this.params = {
        sites: [],
        data: [],
        comparedData: [],
        period: undefined,
        comparedPeriod: undefined
    } as DashboardParams;    

    this.three = Object.assign({}, SITE_NAV_EMPTY_ROOT);
    this.threePos = this.three;
    this.originalSites = undefined;    

    $scope.init = (params: DashboardParams) => {
    
        this.params = angular.copy(params);

        $scope.$watch("params.sitesWithChilds", (newSites: ViewableNode[]) => {
            if (newSites !== undefined && newSites.length) {
                this.originalSites = newSites.slice(0).map((site: ViewableNode) => Object.assign({}, site, {
                    haveItems: newSites.find((s: ViewableNode) => s.parent_id == site.id) != null
                }));
                this.params.sites = this.originalSites.filter((site: ViewableNode) => !site.parent_id);
                this.createSitesTree(newSites);
            }
        });

        $scope.$watch('params.data', (newData: DataItem[]) => {
            if (newData !== undefined && newData.length) {
                this.goNav(this.threePos);
            }
        });

        $scope.$watch('params.comparedData', (newData: DataItem[]) => {
            if (newData == undefined) {
                this.params.comparedData = undefined;
            }
        });

        $scope.$watch('params.period', (newData: QueryPeriod) => {
            if (newData !== undefined) {
                this.params.period = newData;
            }
        });

        $scope.$watch('params.comparedPeriod', (newData: QueryPeriod) => {
            if (newData !== undefined) {
                this.params.comparedPeriod = newData;
            }
        });        

        $scope.reloadData = () => {
            this.uploadData();
        };

        return this.params;
    };

    this.goNav = (nav: SiteNavItem | ViewableNode) => {                

        this.params.sites = this.originalSites.filter((site: ViewableNode) => site.parent_id == nav.id);

        this.uploadData();

        this.threePos = nav;
    };

    this.uploadData = () => {        
        $paramsService.reloadDataWithParams(this.params).then(() => true);            
    };

    this.goUp = () => {

        if (this.threePos.parent) {
            this.threePos = this.threePos.parent;
        }

    };

    this.goChildFromId = (id: string) => {

        const child: SiteNavItem = (<SiteNavItem>this.threePos).childs.find(c => c.id == id);

        if (child) {
            this.goNav(child);
        }

    };

    this.createSitesTree = (items: ViewableNode[]) => {

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
