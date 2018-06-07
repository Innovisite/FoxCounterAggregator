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
      { id: 'in', name: 'rawIn' },
      { id: 'out', name: 'rawOut' },      
      { id: 'count', name: 'Occupancy' },
      { id: 'In', name: 'In' },
      { id: 'Out', name: 'Out' },      
      { id: 'WaitingTime', name: 'WaitingTime' }
    ],
    defaultIndicatorId: undefined,
    defaultRangeId: 'hours'
  });
}

export = KPISitesPeriod;
