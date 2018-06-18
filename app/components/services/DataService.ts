import { ViewableNode } from "../types/site";
import { QueryPeriod, DataEltV2, DataItemV2 } from "../types/data";

/**
 * @class DataService
 * @memberOf FSCounterAggregatorApp
 * @description Get Data from server
 */
export class DataService {

    static $inject = [
        "$http",
        "$q",
        "myconfig"
    ];

    constructor(
        private $http: any,
        private $q: any,
        private myconfig: any
    ) {
    }

    private create_fake_data_elt(siteId: string, key: string, value: number, timeStart: any, duration: number) {
        return {
            nodeId: siteId,
            key: key,
            value: value,
            time: {
                start: timeStart.format(),
                end: timeStart.clone().add(duration, 'm').format()
            }
        };
    }

    private add_fake_data_period(period: QueryPeriod, siteId: string, duration: number, kpi: string, retData: DataEltV2[]) {        
        for (let ts = period.startDate.clone(); ts.unix() < period.endDate.unix(); ts.add(duration, "m")) {
            const val = Math.floor(50 * Math.random());            
            retData.push(this.create_fake_data_elt(siteId, kpi, val, ts, duration));
        }
        return retData;
    }

    private get_fake_data_nodes(siteId: string, period: QueryPeriod): Promise<any> {
        const duration = Math.trunc( Math.random() * 30) + 2;
        const retData: DataEltV2[] = [];
        [ "in", "out", "count", "WaitingTime" ].forEach(kpi => {
            if(Math.random() <= 0.5) {
                this.add_fake_data_period(period, siteId, duration, kpi, retData);
            }
        });       
        return Promise.resolve({ data: retData });
    }

    getDataNodes(siteId: string, period: QueryPeriod): Promise<DataEltV2[]> {
        let promise = this.myconfig.debug ?
            this.get_fake_data_nodes(siteId, period) /* this.$http.get("assets/data_test.json") */ :
            this.$http.get("/api/v1/data_nodes/" + siteId + "/query", {
                params: {
                    start_time: period.startDate.unix(),
                    end_time: period.endDate.unix()
                }
            });
        return promise.then((ret: any) => ret.data);
    }

    /**
    * @function getRawDataForSiteInInterval
    * @memberOf FSCounterAggregatorApp.DataService
    * @description retrieve data for an unique site
    * within a period of time
    */
    getRawDataForSiteInInterval(site: ViewableNode, period: QueryPeriod): Promise<DataItemV2> {
        return this.getDataNodes(site.id, period)
            .then((dataElts: DataEltV2[]) => {
                return {
                    id: site.id,
                    siteInfo: site,
                    data: dataElts
                }
            });
    }

    getPromisesForSitesInInterval(sites: ViewableNode[], period: QueryPeriod): Promise<DataItemV2>[] {
        let promises: Promise<DataItemV2>[] = [];
        sites.forEach((site) => {
            promises.push(this.getRawDataForSiteInInterval(site, period));
        });
        return promises;
    }

    /**
    * @function getRawDataForSitesInInterval
    * @memberOf FSCounterAggregatorApp.DataService
    * @description retrieve data for a set of sites
    * within a period of time
    */
    getRawDataForSitesInInterval(sites: ViewableNode[], period: QueryPeriod): Promise<DataItemV2[]> {
        return this.$q.all(this.getPromisesForSitesInInterval(sites, period));
    }

    /**
    * @function getRawDataForSitesInIntervals
    * @memberOf FSCounterAggregatorApp.DataService
    * @description retrieve data for a set of sites
    * each with a specific period of time
    */
    getRawDataForSitesInIntervals(sites: ViewableNode[], periods: QueryPeriod[]): Promise<DataItemV2[]> {
        let promises: Promise<DataItemV2>[] = [];
        periods.forEach((period) => {
            promises = promises.concat(this.getPromisesForSitesInInterval(sites, period));
        });
        return this.$q.all(promises);
    }

}