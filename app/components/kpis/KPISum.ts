
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

		function computeSum(data: any[]) {
			const dataFilter = data.filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; });

			if (dataFilter.length) {
				return query.periodLive ? felt(dataFilter[dataFilter.length - 1]) : ComputeService.cSum(dataFilter, felt);
			}

			return 0;
		}

		if (query.allsitedata) {

			query.allsitedata.forEach(sitedata => res.value += computeSum(sitedata));			

		} else {

			res.value = computeSum(query.sitedata);			
			
		}

		return res;
	};

}

(<any>KPISum).prototype.$inject = ["$scope", "$controller"];

export = KPISum;