import { AbstractModel } from "../../framework/QFramework";

export interface TransitionBootstrapDto {
    enabled?: boolean;
    min_hold_ms?: number;
    min_exit_game_ms?: number;
    skip_in_editor?: boolean;
}

export interface MaintainInfo {
    title: string;
    msg: string;
    sec: number;
}

export interface FeatureSwitchInfo {
    guest_login: boolean;
    facebook_login: boolean;
    google_login: boolean;
    apple_login: boolean;
}

export interface SupportChannelsDto {
    email?: string;
    whatsapp?: string;
    telegram?: string;
    feedback_url?: string;
    support_enabled?: number;
}

export interface GameHelpEntryDto {
    help_text?: string;
    help_image_url?: string;
}

export interface NetworkDelayConfigDto {
    heart_open?: number;
    heart_time_warn?: number;
    heart_time_disconnect?: number;
    games_delay_open?: number;
    signal_delay_show?: number;
    heartbeat_interval_ms?: number;
}

export class AppBootstrapModel extends AbstractModel {
    public serverVer = "";
    public hotUpdateUrl = "";
    public hotUpdateType = 1;
    public wsGateUrls: string[] = [];
    public httpBaseUrls: string[] = [];
    public apkType = 0;
    public apkUrl = "";
    public apkH5 = "";
    public apkTitle = "";
    public apkDesc = "";
    public maintain: MaintainInfo | null = null;
    public featureSwitch: FeatureSwitchInfo = {
        guest_login: true,
        facebook_login: true,
        google_login: true,
        apple_login: true,
    };
    public serverTimeMs = 0;
    /** CDN root for remote desk bundle (no platform suffix). */
    public remoteDeskUrl = "";
    public support: SupportChannelsDto = {};
    public gameHelp: Record<string, GameHelpEntryDto> = {};
    public transition = {
        enabled: true,
        min_hold_ms: 50,
        min_exit_game_ms: 1000,
        skip_in_editor: false,
    };
    public networkDelay: NetworkDelayConfigDto = {
        heart_open: 1,
        heart_time_warn: 5,
        heart_time_disconnect: 15,
        games_delay_open: 1,
        signal_delay_show: 0,
        heartbeat_interval_ms: 10000,
    };
    public ready = false;

    protected OnInit(): void {}

    public reset(): void {
        this.ready = false;
    }
}
