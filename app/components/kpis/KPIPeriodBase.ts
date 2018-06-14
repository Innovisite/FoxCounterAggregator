import { QueryPeriod, QueryCompute, ComputeRes, DataItemV2 } from '../types/data';
import { KPIOptions, KPIServerParams, EMPTY_KPI_OPTIONS } from '../types/kpi';
import { KPIParams } from '../types/kpi';
import * as ComputeService from "../services/ComputeService";

export class KPIPeriodBase {

    rangeParams: any = ComputeService.DEFAULT_RANGE_PARAMS;

    computeFuncs: any = ComputeService.DEFAULT_COMPUTE_FUNCS;

    defaultFunc = 'KPISum';

    options = EMPTY_KPI_OPTIONS;

    // kpis enabled, use updateIndicators to update using
    // site data elements
    indicators: any = [];

    defaultIndicatorId: any = undefined;

    kpis: any = [];

    // ranges enabled, use updateRanges to update using
    // site data element
    ranges: any = [];

    availableRanges = [
        {
            id: '15min',
            seconds: 900
        }, {
            id: 'hours',
            seconds: 3600,
        }, {
            id: 'days',
            seconds: 21600
        }, {
            id: 'week',
            seconds: 151200
        }, {
            id: 'month',
            seconds: 4687200
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

    updateIndicators(sitedata: DataItemV2) {
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
    }

    updateRanges(sitedata: DataItemV2, kpiId: string) {
        this.ranges = [];
        const firstKPIData = sitedata.data.find((_: any) => _.key === kpiId);
        if (firstKPIData) {
            const dataStepSeconds = ComputeService.getDataStepSeconds(sitedata.data[0]);
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
        return this.getRangeParams(rangeId).label;
    }

    haveIndicator(id: string) {
        return this.indicators.find((_: any) => _.id == id);
    }

    setOptions(options: any) {
        this.options = Object.assign(this.options, options);
    }

    compute(query: QueryCompute): ComputeRes {
        const func = this.getIndicatorFunc(query.indicator);
        if (func !== undefined) {
            return this.computeFuncs[func].compute(query);
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

    getDefaultIndicatorId() {
        return this.defaultIndicatorId;
    }
}