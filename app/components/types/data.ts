import { SiteInfo, ViewableNode } from "./site";

export interface DataElt {
    duration: number;
    in: number;
    out: number;
    occ: number;    
    time: string;
};

export interface QueryPeriod {
    startDate: string|any;
    endDate: string|any;
}

export interface QueryCompute {
    sitedata: DataEltV2[];
    groupBy: string;
    indicator: string;
    period: QueryPeriod;
}

export interface ComputeRes {
    query: QueryCompute;
    data: any[];
    value: number;
}

export interface DataEltV2 {
    nodeId: string;
    key: string;
    time: {
        start: string;
        end: string;
    };
    value: number;
}

export interface DataItemV2 {
    id: string;
    siteInfo: ViewableNode;
    data: DataEltV2[]
};

export interface DataItem {
    id: string;    
    siteInfo: SiteInfo;
    heatmap?: any;
    data: DataElt[];
};