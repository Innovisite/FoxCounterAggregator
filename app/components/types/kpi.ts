import { DataResElt, QueryPeriod } from "./data";

export interface KPIServerParams {
    id: string;
    key: string;
    time: {
        type: "range"|"periods",
        period?: {
            start: string;
            end: string;
        };
    };
    type: string;
    measure: boolean;
    defaultValue: number;
    func: string;
}

export interface KPIOptionsIndicator {
    id: string;
    name: string;
    func: string;
}

export interface KPIOptionsRange {
    id: string;
    name: string;
}

export interface KPIOptions {
    ranges: KPIOptionsRange[];
    indicators: KPIOptionsIndicator[];
    defaultIndicatorId: string;
    defaultRangeId: string;
}

export const EMPTY_KPI_OPTIONS: KPIOptions = {
    ranges: [],
    indicators: [],
    defaultIndicatorId: null,
    defaultRangeId: null
};

export type MomentDate = any;

export type RangeInitFunc = (date: MomentDate) => MomentDate;
export type RangeStepFunc = (date: MomentDate, period?: QueryPeriod) => MomentDate;
export type RangeDistFunc = (date: MomentDate, dateStart: MomentDate) => number;

export interface RangeFunc {
    init: RangeInitFunc;
    step: RangeStepFunc;
    dist: RangeDistFunc;
};

export type ResMapFunc = (elt: DataResElt) => number;