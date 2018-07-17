import { ViewableNode } from './site';

export const USER_LIVE_REFRESH_RATE = 900000; // every 15mns

export interface UserLiveModeConfig {
    enabled: boolean;
    refresh_rate?: number;
}

export interface UserInfo {
    dashboard?: string;
    live_mode?: UserLiveModeConfig;
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