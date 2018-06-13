/**
* @class KPISumGeneric
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of the available indicators
*/

import * as ComputeService from '../services/ComputeService';
import { DataItemV2, QueryCompute } from '../types/data';
import { KPIParams } from '../types/kpi';

function KPISumGeneric($scope: any, $controller: any) {

  this.computeFuncs = ComputeService.DEFAULT_COMPUTE_FUNCS;

  this.defaultFunc = "KPISum";

  this.indicators = [];

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

  this.avoid = [];

  this.options = {
    indicators: [
      { id: 'in', name: 'RawIn' },
			{ id: 'out', name: 'RawOut' },
			{ id: 'count', name: 'Max Occupancy' },
			{ id: 'In', name: 'In' },
			{ id: 'Out', name: 'Out' },
			{ id: 'WaitingTime', name: 'WaitingTime' }
    ]
  };  

  this.setOptions = function (options: any) {
    this.options = Object.assign(this.options, options);
  };

  this.updateIndicators = function (sitedata: DataItemV2) {
    this.indicators = [];
    sitedata.data.forEach(elt => {
      if (!this.indicators.find((_: any) => _.name == elt.key)) {
        const kpi: KPIParams = this.kpis.find((_: any) => _.key == elt.key);
        if (kpi) {
          this.indicators.push({ id: kpi.key, name: elt.key, func: kpi.func });
        }
      }
    });
    this.defaultIndicatorId = this.indicators.length ? this.indicators[0].id : undefined;
    this.setOptions({ indicators: this.indicators, defaultIndicatorId: this.defaultIndicatorId });
    return this.indicators;
  };

  /**
  * @function haveKPI
  * @description return whether or not a kpi exists for this indicator
  */
  /* this.haveKPI = function (indicator) {
    return this.kpis[indicator] !== undefined;
  }; */

  this.getIndicatorFunc = function (id: string) {
    const elt = this.indicators.find((elt: any) => elt.id === id);
    if (elt !== undefined) {
      const kpi = this.kpis.find((elt:KPIParams) => elt.key == id);
      return kpi.func || this.defaultFunc;
    }
    return undefined;
  };  

  /**
  * @function compute
  * @memberOf FSCounterAggregatorApp.KPISumMax
  */
  this.compute = function (query: QueryCompute) {
    var func = this.getIndicatorFunc(query.indicator);
    if (func !== undefined) {
      return this.computeFuncs[func].compute(query);
    }
    return undefined;
  };
}

(<any>KPISumGeneric).prototype.$inject = ["$scope", "$controller"];

export = KPISumGeneric;
