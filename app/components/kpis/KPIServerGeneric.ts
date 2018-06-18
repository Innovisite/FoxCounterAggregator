declare const moment: any;

import { KPIOptions, KPIServerParams, EMPTY_KPI_OPTIONS } from '../types/kpi';
import { DataItemV2, QueryCompute, ComputeRes, QueryPeriod, DataResElt } from '../types/data';

import * as ComputeService from "../services/ComputeService";

import { KPIPeriodBase } from "./KPIPeriodBase";

export class KPIServerGeneric extends KPIPeriodBase {

    static $inject = ["$scope"];

    avoid: any[] = [];

    constructor(private $scope: any) {
        super();

        $scope.init = (params: any) => {

            $scope.$watch("params.kpis", (newKpis: KPIServerParams[], oldKpis: KPIServerParams[]) => {
                if (newKpis !== undefined && newKpis.length) {
                    this.createKPIs(newKpis);
                }
            });

            return this;
        };
    }       

    getIndicatorFunc(key: string) {
        const elt = this.kpis.find((_: KPIServerParams) => _.key == key);
        if (elt !== undefined) {
            return elt.func || this.defaultFunc;
        }
        return undefined;
    }    

    createKPIs(kpis: KPIServerParams[]) {
        this.kpis = kpis;

        if (!this.kpis.length) {
            return;
        }

        this.indicators = [];

        this.setOptions({
            indicators: this.indicators,
            ranges: [
                {
                    id: 'min',
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
            defaultIndicatorId: undefined,
            defaultRangeId: 'min',
        });
    }
}
