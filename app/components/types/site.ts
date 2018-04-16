export interface SiteItem {
    _id: string;
    id?: string;
    items?: SiteItem[];
    name: string;
};

export interface SiteNavItem {
    name: string;
    path: string;
    parent: SiteNavItem;
    childs: SiteNavItem[];
};

export const SITE_NAV_EMPTY_ROOT: SiteNavItem = {
    name: "All",
    path: "",
    parent: undefined,
    childs: []
};