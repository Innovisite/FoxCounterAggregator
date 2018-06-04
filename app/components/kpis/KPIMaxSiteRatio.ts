import * as ComputeService from "../services/ComputeServiceV2";
import { QueryCompute, DataResElt } from "../types/data";

declare const _: any;

/**
 * @class KPIMaxSiteRatio
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve the site which have the biggest amount of data
 */
function KPIMaxSiteRatio() {

	this.getDefaultIndicatorId = () => "in";

	this.getLabel = (id:string) => "";

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPIMaxSiteRatio
	 * @description Returns the site which have the biggest
	 * amount of data
	 */
	this.compute = function (query: QueryCompute) {

		if (!query.indicator)
			query.indicator = this.getDefaultIndicatorId();

		const res = {
			query: query,
			value: 0
		};

		const siteSums = query.allsitedata.map(
			sitedata => sitedata.filter(_ => _.key == query.indicator).map(_ => _.value).reduce((a, b) => a + b, 0)
		);		

		const maxIdx = _.indexOf(siteSums, _.max(siteSums));

		res.value = maxIdx;
		return res;
	};

}

(<any>KPIMaxSiteRatio).prototype.$inject = ["$scope", "$controller"];

export = KPIMaxSiteRatio;