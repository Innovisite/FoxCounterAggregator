import { ViewableNode } from "../types/site";
import { QueryPeriod, DataEltV2, DataItemV2 } from "../types/data";

/**
 * @class DataService
 * @memberOf FSCounterAggregatorApp
 * @description Get Data from server
 */
export class DataServiceV2 {

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
                end: timeStart.add(duration, 'm').format()
            }
        };
    }

    private get_fake_data_nodes(siteId: string, period: QueryPeriod): Promise<any> {        
        const duration = 15;
        const retData: DataEltV2[] = [];
        for (let ts = period.startDate.clone(); ts.unix() < period.endDate.unix(); ts.add(duration, "m")) {
            const vIn = Math.floor(50 * Math.random());
            const vOut = Math.floor(50 * Math.random());
            const vOcc = vOut - vIn;
            retData.push(
                this.create_fake_data_elt(siteId, "in", vIn, ts, duration),
                this.create_fake_data_elt(siteId, "out", vOut, ts, duration),
                this.create_fake_data_elt(siteId, "count", vOcc, ts, duration)
            );
        }
        return Promise.resolve({ data: retData });
    }

    getDataNodes(siteId: string, period: QueryPeriod): Promise<DataEltV2[]> {
        let promise = this.myconfig.debug ?
            this.get_fake_data_nodes(siteId, period) :
            this.$http.get("/data_nodes/" + siteId + "/query", {
                params: {
                    start: period.startDate.unix(),
                    end: period.endDate.unix()
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