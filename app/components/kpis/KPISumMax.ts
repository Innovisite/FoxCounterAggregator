/**
 * @class KPISumMax
 * @memberOf FSCounterAggregatorApp
 * @description Compute the sum or the max depending on the indicator value
 */

import { KPISumGeneric } from "./KPISumGeneric";

export class KPISumMax extends KPISumGeneric {

	constructor() {
		super();

		this.kpis = [
			{
				key: "in",
				func: "KPISum"
			},
			{
				key: "out",
				func: "KPISum"
			},
			{
				key: "count",
				func: "KPIMax"
			},
			{
				key: "In",
				func: "KPISum"
			},
			{
				key: "Out",
				func: "KPISum"
			},
			{
				key: "WaitingTime",
				func: "KPIMax"
			}
		];

		this.setOptions({
			indicators: [
				{ id: 'in', name: 'RawIn' },
				{ id: 'out', name: 'RawOut' },
				{ id: 'count', name: 'Max Occupancy' },
				{ id: 'In', name: 'In' },
				{ id: 'Out', name: 'Out' },
				{ id: 'WaitingTime', name: 'WaitingTime' }
			]
		});
	}
}
