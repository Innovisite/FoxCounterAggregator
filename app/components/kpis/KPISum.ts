
import * as ComputeService from "../services/ComputeService";
import { QueryCompute, DataResElt } from "../types/data";

/**
 * @class KPISum
 * @memberOf FSCounterAggregatorApp
 * @description Compute the sum for a set of data indicators
 */
function KPISum($scope: any, $controller: any) {

	this.getDefaultIndicatorId = () => "in";

	this.getLabel = (id: string) => "total ".concat(id);

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPISum
	 * @description Returns the total of
	 * data within a period of time (for a site or for multi-site)
	 */
	this.compute = (query: QueryCompute) => {

		const res = {
			query: query,
			value: 0
		};

		if (!query.indicator) {
			query.indicator = this.getDefaultIndicatorId();
		}

		const felt = (elt: DataResElt) => elt.y;

		if (query.allsitedata) {
			for (let i = 0; i < query.allsitedata.length; ++i) {
				res.value += ComputeService.cSum(
					query.allsitedata[i].filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; }),
					felt);
			}
		} else {
			res.value += ComputeService.cSum(
				query.sitedata.filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; }),
				felt);
		}

		return res;
	};

}

(<any>KPISum).prototype.$inject = ["$scope", "$controller"];

export = KPISum;