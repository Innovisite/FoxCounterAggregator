import * as ComputeService from "../services/ComputeService";
import { QueryCompute, DataResElt, DataEltV2 } from "../types/data";

/**
 * @class KPIMean
 * @memberOf FSCounterAggregatorApp
 * @description Compute the mean value for on a set of data indicators
 */
export class KPIMean {

	constructor() {		
	}

	getDefaultIndicatorId() {
		return "in";
	}

	getLabel(id: string) {
		return "mean ".concat(id);
	}

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPIMean
	 * @description Returns the mean value of
	 * data within a period of time
	 */
	compute(query: QueryCompute) {

		var res = {
			query: query,
			value: 0
		};

		if (!query.indicator) {
			query.indicator = this.getDefaultIndicatorId();
		}

		const felt = (elt: DataResElt) => elt.y;

		function computeMean(data: any[]) {
			const dataFilter = data.filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; });

			if (dataFilter.length) {
				return /* query.periodLive ? felt(dataFilter[dataFilter.length - 1]) : */ ComputeService.cMean(dataFilter, felt);
			}

			return 0;
		}

		if (query.allsitedata) {
			query.allsitedata.forEach(sitedata => res.value += computeMean(sitedata));
		} else {
			res.value = computeMean(query.sitedata);
		}

		res.value = Math.round(res.value / (query.period.endDate - query.period.startDate));

		return res;
	}

}
