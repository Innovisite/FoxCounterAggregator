declare const moment: any;
declare const _: any;

import { DataEltV2, QueryPeriod, DataResElt, QueryCompute, ComputeRes } from '../types/data';
import { MomentDate, RangeFunc, RangeInitFunc, RangeDistFunc, RangeStepFunc, ResMapFunc } from '../types/kpi';

const NSEC_5MIN = 300;
const NSEC_15MIN = 900;
const NSEC_HOUR = 3600;
const NSEC_DAY = 86400;
const NSEC_WEEK = 604800;

interface RangeFuncMap {
    [id: string]: RangeFunc;
};

type IndexFunc = (elt: DataEltV2) => number;
type CumulFunc = (elt?: DataEltV2, aggregate?: number, pos?: number, length?: number) => number;

interface DataIndexElt {
    x: MomentDate;
    y: number | number[];
};

const rangeFunc: RangeFuncMap = {
    '5min': {
        init: (date: MomentDate) => date.minute(Math.floor(date.minute() / 5) * 5),
        step: (date: MomentDate) => date.add(5, "m"),
        dist: (date: MomentDate, dateStart: MomentDate) => getTimeIndex(date.unix(), dateStart.unix(), NSEC_5MIN)
    },
    '15min': {
        init: (date) => date.minute(Math.floor(date.minute() / 15) * 15),
        step: (date) => date.add(15, "m"),
        dist: (date, dateStart) => getTimeIndex(date.unix(), dateStart.unix(), NSEC_15MIN)
    },
    'hours': {
        init: (date) => date.minute(0),
        step: (date) => date.add(1, "h"),
        dist: (date, dateStart) => getTimeIndex(date.unix(), dateStart.unix(), NSEC_HOUR)
    },
    'days': {
        init: (date) => date.minute(0).hour(0),
        step: (date) => date.add(1, "d"),
        dist: (date, dateStart) => getTimeIndex(date.unix(), dateStart.unix(), NSEC_DAY)
    },
    'week': {
        init: (date) => date.day(1),
        step: (date) => date.add(1, "w"),
        dist: (date, dateStart) => getTimeIndex(date.unix(), dateStart.unix(), NSEC_WEEK)
    },
    'month': {
        init: (date) => date.date(1),
        step: (date) => date.add(1, "M"),
        dist: (date, dateStart) => (date.year() * 12 + date.month()) - (dateStart.year() * 12 + dateStart.month())
    },
    'all': {
        init: (date) => date,
        step: (date, period) => date = period.endDate.clone(),
        dist: (date, dateStart) => 0
    }
};

export const DEFAULT_RANGE_PARAMS = {
    '15min': {
        hourMode: true,
        comparable: false,
        label: function (d: string, p: any) {
            return moment(d).format("dddd, MMMM Do YYYY, HH:mm").concat(moment(d).add(15, "m").format(" - HH:mm"));
        },
        isPeriodComputable: function (period: QueryPeriod) {
            return period.endDate.diff(period.startDate, "days") <= 15;
        }
    },
    'hours': {
        hourMode: true,
        comparable: true,
        label: function (d: string, p: any) {
            return moment(d).format("dddd, MMMM Do YYYY, HH:00");
        },
        isPeriodComputable: function (period: QueryPeriod) {
            return period.endDate.diff(period.startDate, "months") <= 6;
        }
    },
    'days': {
        hourMode: false,
        comparable: true,
        label: function (d: string, p: any) {
            return moment(d).format("dddd, MMMM Do YYYY");
        },
        isPeriodComputable: function (period: QueryPeriod) {
            return period.endDate.diff(period.startDate, "years") <= 2;
        }
    },
    'week': {
        hourMode: false,
        comparable: true,
        label: function (d: string, p: any) {
            return moment.max(p.startDate, moment(d)).format("MMM DD YYYY").concat(moment.min(moment(d).add(1, "w"), p.endDate).format(" - MMM DD YYYY"));
        },
        isPeriodComputable: function (period: QueryPeriod) {
            return period.endDate.diff(period.startDate, "weeks") >= 1;
        }
    },
    'month': {
        hourMode: false,
        comparable: true,
        label: function (d: string, p: any) {
            return moment.max(p.startDate, moment(d)).format("MMM DD YYYY").concat(moment.min(moment(d).add(1, "M"), p.endDate).format(" - MMM DD YYYY"));
        },
        isPeriodComputable: function (period: QueryPeriod) {
            return period.endDate.diff(period.startDate, "months") >= 1;
        }
    }
};

export const DEFAULT_COMPUTE_FUNCS = {
    'KPISum': {
        compute: function (query: QueryCompute): ComputeRes {
            const res: ComputeRes = {
                query: query,
                data: [],
                value: undefined,
                valueCount: 0
            };

            const data = query.sitedata.filter(_ => _.key == query.indicator);

            const sumPeriod = cSumForPeriod(
                data,
                query.period,
                query.groupBy,
                "value"
            );

            res.data = sumPeriod;
            res.value = cSum(sumPeriod, (elt: DataResElt) => elt.y);
            res.valueCount = data.length;

            return res;
        }
    },
    'KPIMean': {
        compute: function (query: QueryCompute): ComputeRes {
            const res: ComputeRes = {
                query: query,
                data: [],
                value: undefined,
                valueCount: 0
            };

            const data = query.sitedata.filter(_ => _.key == query.indicator);

            const meanPeriod = cMeanForPeriod(
                data,
                query.period,
                query.groupBy,
                "value"
            );
            res.data = meanPeriod;
            res.value = Math.round(cMean(meanPeriod, (elt) => elt.y));
            res.valueCount = data.length;

            return res;
        }
    },
    'KPIMax': {
        compute: function (query: QueryCompute): ComputeRes {
            const res: ComputeRes = {
                query: query,
                value: undefined,
                valueCount: 0
            };

            const data = query.sitedata.filter(_ => _.key == query.indicator);

            const maxElt = _.maxBy(
                data,
                "value"
            );
            res.value = maxElt ? maxElt.value : res.value;
            res.valueCount = data.length;

            return res;
        }
    }
};

/**
  * @function getTimeIndex
  * @memberOf FSCounterAggregatorApp.ComputeService
  * @description returns the number of step interval between 2 values
  */
function getTimeIndex(time: number, timeStart: number, step: number) {
    return Math.floor((time - timeStart) / step);
}

/**
* @function createTimeIndex
* @memberOf FSCounterAggregatorApp.ComputeService
* @description returns an array of index elements for a period range
*/
function createTimeIndex(period: QueryPeriod, initFunc: RangeInitFunc, stepFunc: RangeStepFunc, idxFuncValue: RangeDistFunc) {
    const index: DataIndexElt[] = [];
    let ts = initFunc(period.startDate.clone());
    for (let i = 0; ts.unix() < period.endDate.unix(); ++i) {
        index.push({ x: ts.clone(), y: idxFuncValue(i, ts) });
        ts = stepFunc(ts, period);
    }
    return index;
}

/**
 * @function getDataStepSeconds
 * @description Returns the data step in seconds
 */
export function getDataStepSeconds(elt: DataEltV2): number {
    return moment(elt.time.end).unix() - moment(elt.time.start).unix();
}

/**
* @function fillIndex
* @memberOf FSCounterAggregatorApp.ComputeService
* @description create new index
*/
function fillIndex(data: DataEltV2[], index: DataIndexElt[], idxFunc: IndexFunc) {
    for (let i = 0; i < data.length; ++i) {
        const idx = idxFunc(data[i]);
        if (idx !== undefined &&
            idx >= 0 &&
            idx < index.length) {
            if (index[idx].y === undefined) {
                index[idx].y = [i];
            } else {
                (<number[]>index[idx].y).push(i);
            }
        }
    }
    return index;
}

/**
* @function aggregate
* @memberOf FSCounterAggregatorApp.ComputeService
* @description generic function to merge data regarding indexes list
*/
function aggregate(data: DataEltV2[], index: DataIndexElt[], cumulFunc: CumulFunc, endCumulFunc?: CumulFunc) {
    const res: DataResElt[] = [];
    for (let i = 0; i < index.length; ++i) {
        const curIndex = index[i];
        const cumul = { x: curIndex.x, y: cumulFunc() };
        if (curIndex.y !== undefined) {
            for (let j = 0; j < (<number[]>curIndex.y).length; ++j) {
                cumul.y = cumulFunc(data[(<number[]>curIndex.y)[j]], cumul.y, j, (<number[]>curIndex.y).length);
            }
        }
        res.push(cumul);
    }
    return res;
}

/**
* @function cApplyLocalTimezone
* @memberOf FSCounterAggregatorApp.ComputeService
* @description Apply an time offset to sync data to a local timezone
* To get this working we need to apply the offset in seconds between the original timezone 
* and the local timezone.
*/
export function cApplyLocalTimezone(data: DataEltV2[], tzSrc: string) {
    const offsetInSeconds = (moment.tz(tzSrc).utcOffset() - moment().utcOffset()) * 60;
    if (offsetInSeconds !== 0) {
        for (let i = 0; i < data.length; ++i) {
            const elt = data[i];
            elt.time.start = moment(elt.time.start).add(offsetInSeconds, 'seconds').format();
            elt.time.end = moment(elt.time.end).add(offsetInSeconds, 'seconds').format();
        }
    }
}

/**
  * @function cSumForPeriod
  * @memberOf FSCounterAggregatorApp.ComputeService
  * @description aggregate data on a period grouped by step duration
  */
function cFuncForPeriod(data: DataEltV2[], period: QueryPeriod, step: string, id: string, func: CumulFunc) {
    let timeIndex = createTimeIndex(period, rangeFunc[step].init, rangeFunc[step].step, () => undefined);
    timeIndex = fillIndex(data, timeIndex, (elt) => rangeFunc[step].dist(moment(elt.time.start), period.startDate));
    var tdata = aggregate(data, timeIndex, func);
    return tdata;
}

/**
* @function cSum
* @memberOf FSCounterAggregatorApp.ComputeService
* @description Simply returns the sum of all elements in a array
*/
export function cSum(data: DataResElt[], fsum: ResMapFunc) {
    let s = 0;
    for (let i = 0; i < data.length; ++i) {
        s += fsum(data[i]);
    }
    return s;
}

/**
* @function cMean
* @memberOf FSCounterAggregatorApp.ComputeService
* @description Returns the mean of all elements in a array
*/
export function cMean(data: DataResElt[], fsum: ResMapFunc) {
    return data.length === 0 ? 0 : cSum(data, fsum) / data.length;
}

/**
  * @function cSumForPeriod
  * @memberOf FSCounterAggregatorApp.ComputeService
  * @description aggregate data on a period grouped by step duration
  */
export function cSumForPeriod(data: DataEltV2[], period: QueryPeriod, step: string, id: string) {
    return cFuncForPeriod(data, period, step, id, (elt, curCumul) => curCumul !== undefined ? curCumul + (<any>elt)[id] : 0);
}

/**
* @function cMeanForPeriod
* @memberOf FSCounterAggregatorApp.ComputeService
* @description aggregate data on a period grouped by step duration
*/
export function cMeanForPeriod(data: DataEltV2[], period: QueryPeriod, step: string, id: string) {
    return cFuncForPeriod(data, period, step, id,
        (elt, curCumul, pos, length) => {
            if (curCumul !== undefined) {
                return pos == (length - 1) ?
                    Math.round((curCumul + (<any>elt)[id]) / length) :
                    curCumul + (<any>elt)[id];
            } else {
                return 0;
            }
        });
};