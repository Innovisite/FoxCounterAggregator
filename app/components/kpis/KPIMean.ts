import * as ComputeService from "../services/ComputeService";
import { QueryCompute, DataResElt, DataEltV2 } from "../types/data";

/**
 * @class KPIMean
 * @memberOf FSCounterAggregatorApp
 * @description Compute the mean value for on a set of data indicators
 */
function KPIMean($scope: any, $controller: any) {

	this.getDefaultIndicatorId = () => "in";

	this.getLabel = (id: string) => "mean ".concat(id);

	/**
	 * @function compute
	 * @memberOf FSCounterAggregatorApp.KPIMean
	 * @description Returns the mean value of
	 * data within a period of time
	 */
	this.compute = (query: QueryCompute) => {

		var res = {
			query: query,
			value: 0
		};

		if (!query.indicator)
			query.indicator = this.getDefaultIndicatorId();


		const felt = (elt: DataResElt) => elt.y;

		if (query.allsitedata)
			for (let i = 0; i < query.allsitedata.length; ++i) {
				res.value += ComputeService.cMean(
					query.allsitedata[i].filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; }),
					felt
				);
			}
		else
			res.value += ComputeService.cMean(
				query.sitedata.filter(_ => _.key == query.indicator).map(_ => { return { y: _.value }; }),
				felt
			);

		res.value = Math.round(res.value / (query.period.endDate - query.period.startDate));

		return res;
	};

}

(<any>KPIMean).prototype.$inject = ["$scope", "$controller"];

export = KPIMean;