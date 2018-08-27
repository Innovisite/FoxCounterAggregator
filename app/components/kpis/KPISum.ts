
import * as ComputeService from "../services/ComputeService";
import { QueryCompute, DataResElt } from "../types/data";

/**
 * @class KPISum
 * @memberOf FSCounterAggregatorApp
 * @description Compute the sum for a set of data indicators
 */
export class KPISum {

	constructor() {

	}

	getDefaultIndicatorId() {
		return "in";
	}

	getLabel(id: string) {
		return "total ".concat(id);
	}

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPISum
	 * @description Returns the total of
	 * data within a period of time (for a site or for multi-site)
	 */
	compute(query: QueryCompute) {

		const res = {
			query: query,
			value: 0
		};

		if (!query.indicator) {
			query.indicator = this.getDefaultIndicatorId();
		}

		const felt = (elt: DataResElt) => elt.y;

		function computeSum(data: any[]) {
			const dataFilter = data.filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; });

			if (dataFilter.length) {
				return ComputeService.cSum(dataFilter, felt);
			}

			return 0;
		}

		if (query.allsitedata) {

			query.allsitedata.forEach(sitedata => res.value += computeSum(sitedata));

		} else {

			res.value = computeSum(query.sitedata);

		}

		return res;
	}

}
