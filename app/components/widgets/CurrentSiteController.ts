import { ViewableNode } from "../types/site";
import { QueryPeriod } from "../types/data";
import { DashboardParamsService, DashboardParams } from '../services/DashboardParamsService';

declare const angular: any;

/**
 * @class CurrentSiteController
 * @memberOf FSCounterAggregatorApp
 */
function CurrentSiteController($scope: any, $paramsService: DashboardParamsService) {

    this.params = {
        sites: [],
        data: [],
        comparedData: [],
        period: undefined,
        comparedPeriod: undefined
    } as DashboardParams;

    this.currentSite = undefined;
    this.originalSites = [];

    $scope.init = (params: DashboardParams, siteId?: string) => {

        this.params = Object.assign({}, params);

        $scope.$watch("params.sitesWithChilds", (newSites: ViewableNode[]) => {
            if (newSites !== undefined && newSites.length) {
                this.originalSites = newSites;
                if (siteId !== undefined) {
                    this.goNav(siteId);
                }
            }
        });

        $scope.$watch('params.period', (newData: QueryPeriod) => {
            if (newData !== undefined) {
                this.params.period = newData;
                this.uploadData();
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

        if (siteId !== undefined) {
            this.goNav(siteId);
        }

        return this.params;
    };

    this.goNav = (siteId: string) => {

        const site = siteId !== undefined ? this.originalSites.find((site: ViewableNode) => site.id == siteId) : undefined;

        if (site !== undefined) {
            this.currentSite = site;
            this.params.sites = [this.currentSite];
            this.uploadData();
        }
    };

    this.uploadData = () => {

        if (!this.params.sites.length) {
            return;
        }

        $paramsService.reloadDataWithParams(this.params).then(() => true);            
    };

}

(<any>CurrentSiteController).$inject = ["$scope", "DashboardParamsService"];

export = CurrentSiteController;
