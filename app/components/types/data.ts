import { SiteInfo } from "./site";

export interface DataElt {
    duration: number;
    in: number;
    out: number;
    occ: number;
    time: number;
};

export interface DataItem {
    id?: string;
    _id: string;
    siteInfo: SiteInfo;
    heatmap?: any;
    data: DataElt[];
};