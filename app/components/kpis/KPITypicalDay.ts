/**
* @class KPITypicalDay
* @memberOf FSCounterAggregatorApp
* @description Compute the sum of data for each range within a period of time
*/
import * as ComputeService from "../services/ComputeServiceV2";
import KPIPeriodGeneric from "./KPIPeriodGeneric";
import { QueryPeriod, QueryCompute, ComputeRes } from "../types/data";

declare const moment: any;
declare const _: any;

function KPITypicalDay() {

  KPIPeriodGeneric.call(this, ComputeService);

  var _startDate = moment().startOf('week');

  this.rangeParams = {
    'days': {
      label: function (d: any, p: any) {
        return moment(d).format("HH:mm");
      },
      isPeriodComputable: function (period: QueryPeriod) {
        return true;
      },
      getGroupingTimestamp: function (timestamp: number) //return the function to be used when grouping timestmaps
      {
        return moment.unix(timestamp).minutes(0).seconds(0).millisecond(0).unix();
      },
      getNormalisedTimestamp: function (timestamp: number) { //return a uniform timestamp with respect to the aggragation option
        return _startDate.clone().add(moment.unix(timestamp).hours(), "hours").unix();
      },
      getDefaultValues: function () { //the values which should be present in the output array
        var ret: any = {};
        for (var i = 0; i < 24; i++)
          ret[this.getNormalisedTimestamp(i * 3600)] = 0;
        return ret;
      }
    },

    'week': {
      label: function (d: any, p: any) {
        return moment(d).format("dddd");
      },
      isPeriodComputable: function (period: QueryPeriod) {
        return period.endDate.diff(period.startDate, "weeks") >= 1;
      },
      getGroupingTimestamp: function (timestamp: number) //return the function to be used when grouping timestmaps
      {
        return moment.unix(timestamp).hours(0).minutes(0).seconds(0).millisecond(0).unix();
      },
      getNormalisedTimestamp: function (timestamp: number) {
        return _startDate.clone().add(moment.unix(timestamp).days(), "days").unix();
      },
      getDefaultValues: function () {
        var ret: any = {};
        for (var i = 0; i < 24; i++)
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
      id: 'occ',
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
    var startDate = moment();
    var res: ComputeRes = {
      query: query,
      data: [],
      value: undefined
    };

    function groupFnctForIndicator(arr: any[], indicator: string) {
      if (arr.length === 0) return 0;

      var ret = _.sumBy(arr, indicator);
      if (indicator == "occ") ret /= arr.length;
      return ret;
    }

    var rangeParams = this.getRangeParams(query.groupBy);

    if (!query.indicator)
      query.indicator = this.getDefaultIndicatorId();

    //in the case of a typical day: compute the sum for each hour (day 1 hour1, day 1 hour 2, day 2 hour 1, day 2 hour 2, ...)
    // then compute the average for identical hours (hour 1, hour 2, ...)
    res.data = _.chain(query.sitedata)

      //group elements to get the basic elements (hours or day)
      .groupBy(function (siteElement: any) {
        return rangeParams.getGroupingTimestamp(+siteElement.time);
      })
      //compute the sum/avg for each group
      .mapValues(function (allElementsForAMoment: any) {
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
    if (query.indicator == 'occ' && res.data.length > 0) res.value = Math.floor(res.value / res.data.length);

    return res;
  };
}

export = KPITypicalDay;
