/**
* @class KPISumGeneric
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of the available indicators
*/
import { KPIParams } from '../types/kpi';
import { KPIPeriodBase } from './KPIPeriodBase';

declare const _: any;

export class KPISumGeneric extends KPIPeriodBase {

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
