/**
* @class KPITypicalDay
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of data for each range within a period of time
*/
import * as ComputeService from "../services/ComputeService";
import KPIPeriodGeneric from "./KPIPeriodGeneric";
import { QueryPeriod, QueryCompute, ComputeRes, DataEltV2 } from "../types/data";

declare const moment: any;
declare const _: any;

function KPITypicalDay() {

  KPIPeriodGeneric.call(this, ComputeService);

  var _startDate = moment().startOf('week');

  this.rangeParams = {
    'days': {
      label: (d: string, p: any) => moment(d).format("HH:mm"),      
      isPeriodComputable: (period: QueryPeriod) => true,
      //return the function to be used when grouping timestmaps
      getGroupingTimestamp: (timestamp: string) => moment(timestamp).minutes(0).seconds(0).millisecond(0).unix(),      
      getNormalisedTimestamp: function (timestamp: number) { //return a uniform timestamp with respect to the aggragation option
        return _startDate.clone().add(moment.unix(timestamp).hours(), "hours").unix();
      },
      getDefaultValues: function () { //the values which should be present in the output array        
        const ret: any = {};
        for (let i = 0; i < 24; i++)
          ret[this.getNormalisedTimestamp(i * 3600)] = 0;
        return ret;
      }
    },

    'week': {
      label: (d: string, p: any) => moment(d).format("dddd"),    
      isPeriodComputable: (period: QueryPeriod) => period.endDate.diff(period.startDate, "weeks") >= 1,    
      getGroupingTimestamp: function (timestamp: string) //return the function to be used when grouping timestmaps
      {
        return moment(timestamp).hours(0).minutes(0).seconds(0).millisecond(0).unix();
      },
      getNormalisedTimestamp: function (timestamp: number) {
        return _startDate.clone().add(moment.unix(timestamp).days(), "days").unix();
      },
      getDefaultValues: function () {
        const ret: any = {};
        for (let i = 0; i < 24; i++)
          ret[this.getNormalisedTimestamp(i * 3600 * 24)] = 0;
        return ret;
      }
    }
  };

  this.setOptions({
    ranges: [{
      id: 'days',
      name: 'Days'
    },
    {
      id: 'week',
      name: 'Week'
    }],

    indicators: [{
      id: 'in',
      name: 'In'
    },
    {
      id: 'out',
      name: 'Out'
    },
    {
      id: 'count',
      name: 'Occupancy'
    }],

    defaultIndicatorId: 'in',

    defaultRangeId: 'days',

  });

  /**
  * @function getTimeFormat
  * @memberOf FSCounterAggregator.KPITypicalDay
  * @description retrieve style information for a specific period range
  */
  this.getTimeFormat = function (period: any, rangeId: string) {
    return rangeId === 'days' ? "HH:mm" : "ddd";
  };

  /**
  * @function isPeriodComparable
  * @memberOf FSCounterAggregator.KPITypicalDay
  * @description return whether or not this range period
  * could be used for comparisons between multiple sets of data
  */
  this.isPeriodComparable = function (rangeId: any) {
    return false;
  };

  function keepObjValue(objValue: any, srcValue: any) {
    return _.isUndefined(objValue) ? srcValue : objValue;
  }

  /**
  * @function compute
  * @memberOf FSCounterAggregatorApp.KPITypicalDay
  * @description Compute the sum of data for each range within a period of time
  */
  this.compute = function (query: QueryCompute) {    
    
    const startDate = moment();
    
    const res: ComputeRes = {
      query: query,
      data: [],
      value: undefined
    };

    function groupFnctForIndicator(arr: DataEltV2[], indicator: string) {      

      if (arr.length === 0) return 0;

      let ret = _.sumBy(arr, "value");
      if (indicator === "count") ret /= arr.length;
      return ret;
    }

    const rangeParams = this.getRangeParams(query.groupBy);

    if (!query.indicator)
      query.indicator = this.getDefaultIndicatorId();

    //in the case of a typical day: compute the sum for each hour (day 1 hour1, day 1 hour 2, day 2 hour 1, day 2 hour 2, ...)
    // then compute the average for identical hours (hour 1, hour 2, ...)
    res.data = _.chain(query.sitedata.filter(_ => _.key == query.indicator))

      // group elements to get the basic elements (hours or day)
      .groupBy(function (siteElement: DataEltV2) {
        return rangeParams.getGroupingTimestamp(siteElement.time.start);
      })
      //compute the sum/avg for each group
      .mapValues(function (allElementsForAMoment: DataEltV2[]) {            
        return groupFnctForIndicator(allElementsForAMoment, query.indicator);
      })
      //convert to an array
      .map(function (val: number, key: any) {      
        return {
          time: key,
          value: val
        };
      })
      //group elements by the requested interval to compute the average day/week
      .groupBy(function (siteElement: any) {
        return rangeParams.getNormalisedTimestamp(+siteElement.time);
      })
      //compute the average for each group
      .mapValues(function (allElementsForAMoment: any) {
        return allElementsForAMoment.length === 0 ? 0 :
          _.sumBy(allElementsForAMoment, "value") / allElementsForAMoment.length;
      })
      //fill missing values
      .assignWith(rangeParams.getDefaultValues(), keepObjValue) //fill missing values
      //convert to an array of {x, y}
      .map(function (val: number, key: any) {
        return {
          x: moment.unix(key),
          y: Math.round(val)
        };
      })

      .value();

    res.value = _.sumBy(res.data, "y");
    if (query.indicator == 'count' && res.data.length > 0) res.value = Math.floor(res.value / res.data.length);

    return res;
  };
}

export = KPITypicalDay;
