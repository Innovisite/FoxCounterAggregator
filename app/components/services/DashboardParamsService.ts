declare const moment: any;
declare const tz: any;
declare const _: any;

import { ViewableNode } from '../types/site';
import { QueryPeriod, DataItemV2 } from '../types/data';

import { UserService } from './UserService';
import { KPIServerParams } from '../types/kpi';
import { DataService } from './DataService';

import { cApplyLocalTimezone } from './ComputeService';
import { UserLiveModeConfig } from '../types/user';

/**
 * @class DashboardParamsService
 * @memberOf FSCounterAggregatorApp
 * @description Manage global dashboard parameters such as periods
 **/
export class DashboardParamsService {

    static $inject = [
        "$http", "$q", "DataService", "UserService",
        "SiteService", "myconfig"];

    period: QueryPeriod = {
        startDate: moment().hours(0).minutes(0).seconds(0).milliseconds(0),
        endDate: moment().hours(23).minutes(59).seconds(59).milliseconds(999)
    };

    // by default set it to yesterday
    comparedPeriod: QueryPeriod = {
        startDate: this.period.startDate.clone().subtract(1, 'days'),
        endDate: this.period.endDate.clone().subtract(1, 'days')
    };

    /**
     * Contains only root sites list (sites that have no parent)
     */
    sites: ViewableNode[] = [];    
    /**
     * Contains all sites including childs
     */
    sitesWithChilds: ViewableNode[] = [];

    data: DataItemV2[] = [];

    kpis: KPIServerParams[] = [];

    // compared data must be set to empty in order
    // to desactivate period comparisons on widget side
    comparedData: DataItemV2[] = undefined;

    useTimeZone = false;

    liveConfig: UserLiveModeConfig;    

    // use this to control others components behaviour (i.e mono widgets)
    // or to automatically refresh data
    liveMode = false;

    constructor(
        private $http: any,
        private $q: any,
        private DataService: DataService,
        private UserService: UserService,
        private SiteService: any,              
        private myconfig: any
    ) {
    }

    hasLiveModeEnabled() {
        return this.liveConfig && this.liveConfig.enabled;
    }

    updateLiveMode() {
        this.liveMode = this.hasLiveModeEnabled() && this.period.endDate.isSame(moment(), 'day');
        console.log("LIVE MODE UPDATE = ", this.liveMode);
    }

    loadParams() {        

        return this.UserService.getSettings().
            then((data) => {                
                this.sitesWithChilds = data.viewable_nodes;
                this.sites = this.sitesWithChilds.filter(site => !site.parent_id);
                this.liveConfig = data.app_data.live_mode;
                return this.getKPIs();
            })
            .then(kpis => {
                this.kpis = kpis.data;
                return this;
            });
    }  

    convertSiteTimezone(data: DataItemV2[]) {

        data.filter(_ => _.siteInfo && _.siteInfo.app_data && _.siteInfo.app_data.timezone).forEach(item => {            
            cApplyLocalTimezone(item.data, item.siteInfo.app_data.timezone);
        });

    }

    loadDataOnPeriod(sites: ViewableNode[], period: QueryPeriod) {        

        if (!this.useTimeZone) {
            return this.DataService.getRawDataForSitesInInterval(sites, period);
        } else {
            const tzSites = sites.filter(_ => _.app_data !== undefined && _.app_data.timezone !== undefined);
            return this.DataService.getRawDataForSitesInIntervals(
                tzSites,
                tzSites.map(_ => {
                    return {
                        startDate: moment.tz(period.startDate.format("YYYY-MM-DD HH:mm:ss"), _.app_data.timezone),
                        endDate: moment.tz(period.endDate.format("YYYY-MM-DD HH:mm:ss"), _.app_data.timezone)
                    };
                })
            )
            .then(data => {                
                this.convertSiteTimezone(data);
                return data;
            });            
        }
    }

    loadData() {
        return this.loadDataOnPeriod(this.sites, this.period)
            .then((data) => {
                this.data = data;
                return this;
            });
    }

    loadDataCompared() {
        return this.loadDataOnPeriod(this.sites, this.comparedPeriod)
            .then((data) => {
                this.comparedData = data;
                return this.loadData();
            });
    }

    // reload all the data including comparison if activated
    reloadData() {
        const promises = [ this.loadData() ];
        if (this.comparedData !== undefined) {
            promises.push(this.loadDataCompared());
        }
        return this.$q.all(promises);
    }

    // must be called in order to remove comparison on widget sides
    disableDataCompared() {
        this.comparedData = undefined;
    }

    /**
    * Fetch data using the specified sites list, using
    * the current period, tz and compared params.
    * Returns promise on data & comparedData if activated
    */
    loadDataForSites(sites: ViewableNode[]) {
        const promises = [
            this.loadDataOnPeriod(sites, this.period)
        ];
        if (this.comparedData !== undefined) {
            promises.push(
                this.loadDataOnPeriod(sites, this.comparedPeriod)
            );
        }
        return this.$q.all(promises);
    }

    getKPIs() {
        return this.$http.get("assets/kpis.json");
    }
}
