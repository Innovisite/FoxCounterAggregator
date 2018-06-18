import { QueryPeriod, QueryCompute, ComputeRes, DataItemV2 } from '../types/data';
import { KPIOptions, KPIServerParams, EMPTY_KPI_OPTIONS } from '../types/kpi';
import { KPIParams } from '../types/kpi';
import * as ComputeService from "../services/ComputeService";

declare const _: any;

export class KPIPeriodBase {

    rangeParams: any = ComputeService.DEFAULT_RANGE_PARAMS;

    computeFuncs: any = ComputeService.DEFAULT_COMPUTE_FUNCS;

    defaultFunc = 'KPISum';

    options = EMPTY_KPI_OPTIONS;

    forMinutesPeriodSeconds = ComputeService.NSEC_15MIN;

    // kpis enabled, use updateIndicators to update using
    // site data elements
    indicators: any = [];

    defaultIndicatorId: any = undefined;

    kpis: KPIParams[] = [];

    // ranges enabled, use updateRanges to update using
    // site data element
    ranges: any = [];

    availableRanges = [
        {
            id: 'min',
            seconds: ComputeService.NSEC_15MIN
        }, {
            id: 'hours',
            seconds: ComputeService.NSEC_HOUR,
        }, {
            id: 'days',
            seconds: ComputeService.NSEC_DAY
        }, {
            id: 'week',
            seconds: ComputeService.NSEC_WEEK
        }, {
            id: 'month',
            seconds: ComputeService.NSEC_MONTH
        }
    ];

    constructor() {
    }

    /**
  * @function getTimeFormat
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description retrieve style information for a specific period range
  */
    getTimeFormat(period: QueryPeriod, rangeId: string): string {
        if (period.endDate.diff(period.startDate, "weeks") > 8) {
            return "MMMM YYYY";
        } else if (period.endDate.diff(period.startDate, "days") > 2) {
            return "MMM DD";
        } else {
            return this.getRangeParams(rangeId).hourMode ? "HH:mm" : "MMM DD";
        }
    }

    updateIndicators(sites: DataItemV2[]) {
        this.indicators = sites
            .map(sitedata => _.uniqBy(sitedata.data, "key"))
            .reduce((acc: any, value: any) => _.unionBy(acc, value, "key"))
            .map((elt: any) => {
                const kpi = this.kpis.find((_: any) => _.key == elt.key);
                return kpi ? { id: kpi.key, name: elt.key, func: kpi.func } : undefined;
            })
            .filter((kpi: any) => kpi);
        this.defaultIndicatorId = this.indicators.length ? this.indicators[0].id : undefined;
        this.setOptions({ indicators: this.indicators, defaultIndicatorId: this.defaultIndicatorId });
        return this.indicators;
    }

    updateRanges(sitedata: DataItemV2, kpiId: string) {
        this.ranges = [];
        const firstKPIData = sitedata.data.find((_: any) => _.key === kpiId);
        if (firstKPIData) {
            const dataStepSeconds = ComputeService.getDataStepSeconds(sitedata.data[0]);

            // if the period of data is less than 1 hour, we use the appropriate data period for per minutes             
            if (dataStepSeconds < ComputeService.NSEC_HOUR) {
                this.forMinutesPeriodSeconds = dataStepSeconds;
                const availableRangesMinutes = this.availableRanges.find(_ => _.id === 'min');
                availableRangesMinutes.seconds = this.forMinutesPeriodSeconds;
            }

            this.ranges = this.options.ranges
                .map((_: any) => Object.assign({}, _, this.availableRanges.find((r: any) => r.id === _.id)))
                .filter((_: any) => dataStepSeconds <= _.seconds);
        }
        return this.ranges;
    }

    /**
  * @function getRangeParams
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description returns the parameters for a specific period id
  */
    getRangeParams(id: string) {
        return this.rangeParams[id];
    }

    /**
  * @function getRangeTimeFormat
  * @memberOf FSCounterAggregator.KPISitesPeriod
  * @description returns the appropriate function which set the date format
  */
    getRangeTimeFormat(rangeId: string) {
        return rangeId === "min" ? this.getRangeParams(rangeId).label.bind(null, this.forMinutesPeriodSeconds) : this.getRangeParams(rangeId).label;
    }

    haveIndicator(id: string | undefined) {
        return id !== undefined && this.indicators.find((_: any) => _.id == id);
    }

    setOptions(options: any) {
        this.options = Object.assign(this.options, options);
    }

    compute(query: QueryCompute): ComputeRes {
        const func = this.getIndicatorFunc(query.indicator);
        if (func !== undefined) {
            return query.groupBy === "min" ?
                this.computeFuncs["KPIDirect"].compute({ ...query, periodInterval: this.forMinutesPeriodSeconds }) :
                this.computeFuncs[func].compute(query);
        }
        return undefined;
    }

    getIndicatorFunc(id: string) {
        const elt = this.indicators.find((elt: any) => elt.id === id);
        if (elt !== undefined) {
            const kpi = this.kpis.find((elt: KPIParams) => elt.key == id);
            return kpi.func || this.defaultFunc;
        }
        return undefined;
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

    getDefaultIndicatorId() {
        return this.defaultIndicatorId;
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
        return rangeId !== undefined && this.getRangeParams(rangeId).comparable;
    }
}