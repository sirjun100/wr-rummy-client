import { AbstractModel } from "../../framework/QFramework";

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
    public ready = false;

    protected OnInit(): void {}

    public reset(): void {
        this.ready = false;
    }
}
