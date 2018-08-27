import { QueryCompute, ComputeRes } from "../types/data";

declare const _: any;

/**
 * @class KPIMaxSiteRatio
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve the site which have the biggest amount of data
 */
export class KPIMaxSiteRatio {

	constructor() {		
	}

	getDefaultIndicatorId() {
		return "in";
	}

	getLabel() {
		return "";
	}

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPIMaxSiteRatio
	 * @description Returns the site which have the biggest
	 * amount of data
	 */
	compute(query: QueryCompute) {				

		if (!query.indicator)
			query.indicator = this.getDefaultIndicatorId();

		const res: ComputeRes = {
			query: query,
			value: 0,
			isSiteIndex: true
		};

		const siteSums = query.allsitedata.map(
			sitedata => sitedata.filter(_ => _.key == query.indicator).map(_ => _.value).reduce((a, b) => a + b, 0)
		);		

		const maxIdx = _.indexOf(siteSums, _.max(siteSums));

		res.value = maxIdx;
		return res;
	}

}
