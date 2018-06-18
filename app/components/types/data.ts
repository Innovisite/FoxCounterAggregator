import { SiteInfo, ViewableNode } from "./site";
import { MomentDate, KPIServerParams } from "./kpi";

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
    kpis?: KPIServerParams[];
    allsitedata?: DataEltV2[][]
    sitedata: DataEltV2[];
    groupBy: string;
    indicator: string;
    period: QueryPeriod;
}

export interface DataResElt {
    x?: MomentDate;
    y: number;
}

export interface ComputeRes {
    query: QueryCompute;    
    data?: DataResElt[];
    value?: number;
    valueCount?: number; // when value is used then it's the number of element used for computing the value 0 means no element
    // if true then the returned value refer to the data from the index position in the allsitedata array 
    // this is used for example to find a site that have some special properties (max count, occupation...)
    // default is false
    isSiteIndex?: boolean; 
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