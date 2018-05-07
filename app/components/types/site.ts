export interface SiteInfo {
    id: string;
    heatmap?: any;
    occupancyTimeReset?: string;
    timezone?: string;
};

export interface SiteItem {
    _id: string;
    id?: string;
    items?: SiteItem[];
    name: string;
};

export interface ViewableNode {
    id: string;
    parent_id: string|null;
    type: 'compound-node'|'raw-node';
    display_name: string;
    app_data: SiteInfo;
};

export interface SiteNavItem {
    name: string;
    id: string;
    path: string;
    parent: SiteNavItem;
    childs: SiteNavItem[];   
};

export const SITE_NAV_EMPTY_ROOT: SiteNavItem = {
    name: "All",
    path: "",
    id: null,
    parent: undefined,
    childs: []    
};