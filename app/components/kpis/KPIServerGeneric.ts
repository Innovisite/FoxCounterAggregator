declare const moment: any;

import { KPIOptions, KPIServerParams, EMPTY_KPI_OPTIONS } from '../types/kpi';
import { DataItemV2, QueryCompute, ComputeRes, QueryPeriod } from '../types/data';

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
        }
    };

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
        const res: ComputeRes = {
            query: query,
            data: query.sitedata
                .filter(_ => _.key == query.indicator)
                .map(elt => {
                    return {
                        x: moment(elt.time.start),
                        y: elt.value
                    };
                }),
            value: 0
        };
        return res;
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
            ranges: [{
                id: '15min',
                name: 'Minutes'
            }],
            defaultIndicatorId: this.kpis[0].key,
            defaultRangeId: '15min',
        });
    };
}

(<any>KPIServerGeneric).prototype.$inject = ["$scope", "$controller"];

export = KPIServerGeneric;
