import { DataResElt, QueryPeriod } from "./data";

export interface KPIParams {
    key: string;
    func: string;
}

export interface KPIServerParams extends KPIParams {
    id: string;    
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
    getLabel?: (id: string) => string;
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