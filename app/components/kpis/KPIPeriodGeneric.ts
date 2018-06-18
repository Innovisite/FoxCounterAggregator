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
          id: 'min',
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

}
