declare const moment: any;

import { KPIOptions, KPIServerParams, EMPTY_KPI_OPTIONS } from '../types/kpi';
import { DataItemV2, QueryCompute, ComputeRes, QueryPeriod, DataResElt } from '../types/data';

import * as ComputeService from "../services/ComputeServiceV2";

function KPIServerGeneric($scope: any, $controller: any) {

    this.rangeParams = ComputeService.DEFAULT_RANGE_PARAMS;

    this.computeFuncs = ComputeService.DEFAULT_COMPUTE_FUNCS;

    this.defaultFunc = 'KPISum';

    this.avoid = [];

    this.kpis = [];

    this.indicators = [];

    this.options = EMPTY_KPI_OPTIONS;

    const that = this;

    $scope.init = function (params: any) {

        $scope.$watch("params.kpis", (newKpis: KPIServerParams[], oldKpis: KPIServerParams[]) => {
            if (newKpis !== undefined && newKpis.length) {
                that.createKPIs(newKpis);
            }
        });

        return that;
    };

    this.compute = function (query: QueryCompute): ComputeRes {
        const func = this.getIndicatorFunc(query.indicator);
        if (func !== undefined) {
            return this.computeFuncs[func].compute(query);
        }
        return undefined;
    };

    this.getTimeFormat = function (period: QueryPeriod, rangeId: string) {
        if (period.endDate.diff(period.startDate, "weeks") > 8) {
            return "MMMM YYYY";
        } else if (period.endDate.diff(period.startDate, "days") > 2) {
            return "MMM DD";
        } else {
            return this.getRangeParams(rangeId).hourMode ? "HH:mm" : "MMM DD";
        }
    };

    this.setOptions = function (options: KPIOptions) {
        this.options = Object.assign(this.options, options);
    };

    this.updateIndicators = (sitedata: DataItemV2) => {
        this.indicators = [];
        sitedata.data.forEach(elt => {
            if (!this.indicators.find((_: any) => _.name == elt.key)) {
                const kpi = this.kpis.find((_: any) => _.key == elt.key);
                if (kpi) {
                    this.indicators.push({ id: kpi.key, name: elt.key });
                }
            }
        });
        this.setOptions({indicators: this.indicators});
        return this.indicators;
    };

    this.getRangeParams = function (id: string) {
        return this.rangeParams[id];
    };

    this.isPeriodComputable = function (period: QueryPeriod, rangeId: string) {
        return this.getRangeParams(rangeId).isPeriodComputable(period);
    };

    this.isPeriodComparable = function (rangeId: string) {
        return this.getRangeParams(rangeId).comparable;
    };

    this.haveIndicator = function (id: string): boolean {
        return this.indicators.find((_: any) => _.id == id);
    };

    this.getIndicatorFunc = function (key: string) {
        const elt = this.kpis.find((_: KPIServerParams) => _.key == key);
        if (elt !== undefined) {
            return elt.func || this.defaultFunc;
        }
        return undefined;
    };

    this.getIndicatorName = (id: string): string => {
        const elt = this.indicators.find((_: any) => _.id == id);
        return elt ? elt.name : "";
    };

    this.getRangeTimeFormat = function (rangeId: string) {
        return this.getRangeParams(rangeId).label;
    };

    this.createKPIs = (kpis: KPIServerParams[]) => {
        this.kpis = kpis;

        if (!this.kpis.length) {
            return;
        }

        this.indicators = [];

        this.setOptions({
            indicators: this.indicators,
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
            defaultIndicatorId: this.kpis[0].key,
            defaultRangeId: '15min',
        });
    };
}

(<any>KPIServerGeneric).prototype.$inject = ["$scope", "$controller"];

export = KPIServerGeneric;
