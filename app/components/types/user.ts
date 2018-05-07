import { ViewableNode } from './site';

export interface UserInfo {
    dashboard?: string;
}

export interface UserSettings {
    type: 'user';
    id: string;
    display_name: string;
    email: string;
    is_enabled: boolean;
    is_global_administrator: boolean;
    app_data?: UserInfo;
    viewable_nodes: ViewableNode[];
}