import { QueryCompute } from "../types/data";

/**
 * @class KPIMax
 * @memberOf FSCounterAggregatorApp
 * @description Compute the max value for on a set of data indicators
 */
export class KPIMax {

	constructor() {

	}

	getDefaultIndicatorId() {
		return "in";
	}

	getLabel(id: string) {
		return "max ".concat(id);
	}

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPIMean
	 * @description Returns the mean value of
	 * data within a period of time
	 */
	compute(query: QueryCompute) {

		// todo: use the kpi default value as the default max
		function computeMaxSite(data: number[]) {
			return data.reduce((a, b) => a >= b ? a : b, 0);
		}

		var res = {
			query: query,
			value: 0
		};

		if (!query.indicator)
			query.indicator = this.getDefaultIndicatorId();

		if (query.allsitedata)
			for (let i = 0; i < query.allsitedata.length; ++i) {
				const siteMax = computeMaxSite(
					query.allsitedata[i]
						.filter(_ => _.key == query.indicator)
						.map(_ => _.value)
				);
				if (siteMax > res.value)
					res.value = siteMax;
			}
		else {
			const maxElt = computeMaxSite(
				query.sitedata
					.filter(_ => _.key == query.indicator)
					.map(_ => _.value)
			);
			res.value = maxElt ? maxElt : 0;
		}

		return res;
	}
}
