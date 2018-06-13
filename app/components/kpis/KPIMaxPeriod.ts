import * as ComputeService from "../services/ComputeService";
import { QueryCompute, DataResElt, DataEltV2 } from "../types/data";

declare const _: any;
declare const moment: any;

/**
 * @class KPIMaxPeriod
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve the period which have the max indicator value
 */
function KPIMaxPeriod() {

    this.getDefaultIndicatorId = () => "in";

    this.getLabel = (id: string) => "max period";

    function groupSiteByHour(data: DataEltV2[], indicator: string) {
        const arrayOfDataPerHour = _.groupBy(
            data.filter(_ => _.key == indicator),
            (item:DataEltV2) => moment(item.time.start).add(1800, "s").hour() //the closest hour (16:45 -> 17:00)
        );

        const siteByHour = _.mapValues(arrayOfDataPerHour, (it: DataEltV2) => _.sumBy(it, "value"));    

        return siteByHour;
    }

    function groupAllSitesByHour(data: DataEltV2[][], indicator: string) {
        const sitesSumByHour = _.map(data, (siteData: DataEltV2[]) => groupSiteByHour(siteData, indicator));

        return _.reduce(sitesSumByHour, function (acc: any, siteSumByHour: any) {
            _.forEach(siteSumByHour, function (value: any, hour: any) {
                acc[hour + ""] = value + (acc[hour + ""] | 0);
            });
            return acc;
        }, {});
    }


    /**
     * @function compute
     * @memberOf FSCounterAggregatorApp.KPIMaxPeriod
     * @description Returns the period which have the max value
     */
    this.compute = function (query: QueryCompute) {
        if (!query.indicator)
            query.indicator = this.getDefaultIndicatorId();

        const res = {
            query: query,
            value: 0
        };

        let hours = [];

        if (query.allsitedata)
            hours = groupAllSitesByHour(query.allsitedata, query.indicator);
        else if (query.sitedata)
            hours = groupSiteByHour(query.sitedata, query.indicator);

        var mx = _.max(_.values(hours));
        var maxHour = _.findKey(hours, (v:any) => v == mx);


        res.value = maxHour ? maxHour : "no data";

        return res;
    };
}

(<any>KPIMaxPeriod).prototype.$inject = ["$scope", "$controller"];

export = KPIMaxPeriod;