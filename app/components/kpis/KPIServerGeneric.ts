declare const moment: any;

import { KPIOptions, KPIServerParams, EMPTY_KPI_OPTIONS } from '../types/kpi';
import { DataItemV2, QueryCompute, ComputeRes, QueryPeriod, DataResElt } from '../types/data';

import * as ComputeService from "../services/ComputeServiceV2";

function KPIServerGeneric($scope: any, $controller: any) {

    this.rangeParams = {
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

    this.computeFuncs = {
        'KPISum': {
            compute: function (query: QueryCompute): ComputeRes {
                const res: ComputeRes = {
                    query: query,
                    data: [],
                    value: undefined
                };

                const sumPeriod = ComputeService.cSumForPeriod(
                    query.sitedata.filter(_ => _.key == query.indicator),
                    query.period,
                    query.groupBy,
                    "value"
                );
                res.data = sumPeriod;
                res.value = ComputeService.cSum(sumPeriod, (elt: DataResElt) => elt.y);
                return res;
            }
        },
        'KPIMean': {
            compute: function (query: QueryCompute): ComputeRes {
                const res: ComputeRes = {
                    query: query,
                    data: [],
                    value: undefined
                };

                const meanPeriod = ComputeService.cMeanForPeriod(
                    query.sitedata.filter(_ => _.key == query.indicator),
                    query.period,
                    query.groupBy,
                    "value"
                );
                res.data = meanPeriod;
                res.value = Math.round(ComputeService.cMean(meanPeriod, (elt) => elt.y));
                return res;
            }
        }
    };

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

    this.updateIndicators = function (sitedata: DataItemV2) {
        sitedata.data.forEach(elt => {
            if (!this.indicators.find((_: any) => _.name == elt.key)) {
                const kpi = this.kpis.find((_: any) => _.key == elt.key);
                if (kpi) {
                    this.indicators.push({ id: kpi.key, name: elt.key });
                }
            }
        });
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
