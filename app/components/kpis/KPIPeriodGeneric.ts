/**
* @class KPIPeriodGeneric
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of data for each range within a period of time
*/

import * as ComputeService from '../services/ComputeService';
import { QueryPeriod, QueryCompute, ComputeRes, DataItemV2 } from '../types/data';
import { KPIParams } from '../types/kpi';

import { KPIPeriodBase } from "./KPIPeriodBase";

declare const moment: any;

export class KPIPeriodGeneric extends KPIPeriodBase {

  avoid: any[] = [];

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
        func: "KPIMean"
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
        func: "KPIMean"
      }
    ] as KPIParams[];

    this.options = {
      ranges: [
        {
          id: '15min',
          name: 'Minutes'
        }, {
          id: 'hours',
          name: 'Hours'
        }, {
          id: 'days',
          name: 'Days'
        }, {
          id: 'week',
          name: 'Weeks'
        }, {
          id: 'month',
          name: 'Months'
        }
      ],
      indicators: [],
      defaultIndicatorId: undefined,
      defaultRangeId: 'hours',
      getLabel: (id: string) => id
    };

  }

  /**
  * @function isPeriodComputable
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description return whether or not we can compute the KPI
  * for a specific period size
  */
  isPeriodComputable(period: QueryPeriod, rangeId: string) {
    return this.getRangeParams(rangeId).isPeriodComputable(period);
  }

  /**
  * @function isPeriodComparable
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description return whether or not this range period
  * could be used for comparisons between multiple sets of data
  */
  isPeriodComparable(rangeId: string) {
    return rangeId && this.getRangeParams(rangeId).comparable;
  }

  /**
  * @function getIndicatorName
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description returns the displayed indicator label
  */
  getIndicatorName(indicatorId: string) {
    var elt = this.indicators.find((_: any) => _.id == indicatorId);
    if (elt !== undefined) {
      return elt.name || elt.id;
    }
    return undefined;
  }

  /**
  * @function compute
  * @memberOf FSCounterAggregatorApp.KPISitesPeriod
  * @description Compute the sum of data for each range within a period of time
  */
  compute(query: QueryCompute) {
    const func = this.getIndicatorFunc(query.indicator);
    if (func !== undefined) {
      return this.computeFuncs[func].compute(query);
    }
    return undefined;
  }
}
