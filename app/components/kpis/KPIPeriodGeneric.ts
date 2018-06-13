/**
* @class KPIPeriodGeneric
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of data for each range within a period of time
*/

import * as ComputeService from '../services/ComputeService';
import { QueryPeriod, QueryCompute, ComputeRes, DataItemV2 } from '../types/data';
import { KPIParams } from '../types/kpi';

declare const moment: any;

export default function KPIPeriodGeneric() {

  this.computeFuncs = ComputeService.DEFAULT_COMPUTE_FUNCS;

  this.defaultFunc = 'KPISum';

  this.rangeParams = ComputeService.DEFAULT_RANGE_PARAMS;

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

    getLabel: function (id: string) {
      return id;
    }
  };

  /**
  * @function getTimeFormat
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description retrieve style information for a specific period range
  */
  this.getTimeFormat = (period: QueryPeriod, rangeId: string) => {
    if (period.endDate.diff(period.startDate, "weeks") > 8) {
      return "MMMM YYYY";
    } else if (period.endDate.diff(period.startDate, "days") > 2) {
      return "MMM DD";
    } else {
      return this.getRangeParams(rangeId).hourMode ? "HH:mm" : "MMM DD";
    }
  };

  /**
  * @function isPeriodComputable
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description return whether or not we can compute the KPI
  * for a specific period size
  */
  this.isPeriodComputable = function (period: QueryPeriod, rangeId: string) {
    return this.getRangeParams(rangeId).isPeriodComputable(period);
  };

  /**
  * @function isPeriodComparable
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description return whether or not this range period
  * could be used for comparisons between multiple sets of data
  */
  this.isPeriodComparable = function (rangeId: string) {
    return this.getRangeParams(rangeId).comparable;
  };

  /**
  * @function getRangeParams
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description returns the parameters for a specific period id
  */
  this.getRangeParams = function (id: string) {
    return this.rangeParams[id];
  };

  /**
  * @function getRangeTimeFormat
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description returns the appropriate function which set the date format
  */
  this.getRangeTimeFormat = function (rangeId: string) {
    return this.getRangeParams(rangeId).label;
  };

  /**
  * @function getIndicatorName
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description returns the displayed indicator label
  */
  this.getIndicatorName = function (indicatorId: string) {
    var elt = this.indicators.find((_: any) => _.id == indicatorId);
    if (elt !== undefined) {
      return elt.name || elt.id;
    }
    return undefined;
  };

  this.haveIndicator = function(id: string) {
    return this.indicators.find((_: any) => _.id == id);
  };

  this.getIndicatorFunc = function (id: string) {
    const elt = this.indicators.find((elt: any) => elt.id === id);
    if (elt !== undefined) {
      const kpi = this.kpis.find((elt:KPIParams) => elt.key == id);
      return kpi.func || this.defaultFunc;
    }
    return undefined;
  };
  
  this.setOptions = function (options: any) {
    this.options = Object.assign(this.options, options);
  };  

  this.updateIndicators = function (sitedata: DataItemV2) {    
    this.indicators = [];
    sitedata.data.forEach(elt => {
      if (!this.indicators.find((_: any) => _.name == elt.key)) {
        const kpi = this.kpis.find((_: any) => _.key == elt.key);
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
  * @function compute
  * @memberOf FSCounterAggregatorApp.KPISitesPeriod
  * @description Compute the sum of data for each range within a period of time
  */
  this.compute = function (query: QueryCompute) {        
    var func = this.getIndicatorFunc(query.indicator);
    if (func !== undefined) {
      return this.computeFuncs[func].compute(query);
    }
    return undefined;
  };
}
