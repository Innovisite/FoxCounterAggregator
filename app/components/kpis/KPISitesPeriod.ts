/**
* @class KPISitesPeriod
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of data for each range within a period of time
*/

import KPIPeriodGeneric from "./KPIPeriodGeneric";

function KPISitesPeriod() {

  KPIPeriodGeneric.call(this);

  this.setOptions({
    indicators: [
      { id: 'in', name: 'In', func: 'KPISum' },
      { id: 'out', name: 'Out', func: 'KPISum' },
      { id: 'occ', name: 'Occupancy', func: 'KPIMean' }
    ],
    defaultIndicatorId: 'in',
    defaultRangeId: 'hours'
  });
}

export = KPISitesPeriod;
