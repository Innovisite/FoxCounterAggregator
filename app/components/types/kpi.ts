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