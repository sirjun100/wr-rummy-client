import { native, sys } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { BootstrapReadyEvent, HotUpdateStateEvent, StartProgressEvent } from "../event/StartEvents";
import { AppBootstrapModel } from "../model/AppBootstrapModel";
import { StartFlowModel } from "../model/StartFlowModel";
import { StartupSteps } from "../config/StartConfig";
import { NetworkSystem } from "./NetworkSystem";

/**
 * 启动域：bootstrap 拉取 + 原生热更（P0 Web 跳过 AssetsManager）。
 */
export class StartupSystem extends AbstractSystem {
    protected OnInit(): void {}

    public emitProgress(stepIndex: number, progress: number): void {
        const flow = this.GetModel(StartFlowModel);
        flow.setProgress(stepIndex, progress);
        this.SendEvent(new StartProgressEvent(stepIndex, progress));
    }

    public async fetchBootstrap(): Promise<void> {
        this.emitProgress(1, StartupSteps[1].start);
        const net = this.GetSystem(NetworkSystem);
        await net.resolveHttpBase();
        const data = await net.fetchBootstrap();
        const model = this.GetModel(AppBootstrapModel);
        model.serverVer = data.server_ver ?? "";
        model.hotUpdateUrl = data.hot_update_url ?? "";
        model.hotUpdateType = data.hot_update_type ?? 1;
        model.wsGateUrls = data.ws_gate_urls ?? [];
        model.httpBaseUrls = data.http_base_urls ?? [];
        model.apkType = data.apk_type ?? 0;
        model.apkUrl = data.apk_url ?? "";
        model.apkH5 = data.apk_h5 ?? "";
        model.apkTitle = data.apk_title ?? "";
        model.apkDesc = data.apk_desc ?? "";
        model.maintain = data.maintain ?? null;
        model.featureSwitch = data.feature_switch ?? model.featureSwitch;
        model.serverTimeMs = data.server_time_ms ?? 0;
        model.remoteDeskUrl = data.remote_desk_url ?? data.remote_bundles?.desk ?? "";
        if (data.network_delay) {
            model.networkDelay = { ...model.networkDelay, ...data.network_delay };
        }
        if (data.support) {
            model.support = { ...model.support, ...data.support };
        }
        if (data.game_help) {
            model.gameHelp = { ...data.game_help };
        }
        if (data.transition) {
            model.transition = { ...model.transition, ...data.transition };
        }
        model.ready = true;
        if (data.support) {
            void import("../../../subpackage/function/shared/commonUi/script/PublicModule").then((m) => {
                m.applySupportChannels(data.support);
            });
        }
        void import("../../../subpackage/function/tableChrome/networkOverlay/script/NetworkDelayModule").then((m) => {
            m.ensureNetworkDelayRegistered();
            void import("../../../subpackage/function/tableChrome/networkOverlay/script/command/ApplyNetworkDelayConfigCommand").then(
                ({ ApplyNetworkDelayConfigCommand }) => {
                    this.SendCommand(new ApplyNetworkDelayConfigCommand(model.networkDelay));
                },
            );
        });
        this.emitProgress(1, StartupSteps[1].end);
        this.SendEvent(new BootstrapReadyEvent());
    }

    public async checkHotUpdate(): Promise<boolean> {
        this.emitProgress(2, StartupSteps[2].start);
        this.SendEvent(new HotUpdateStateEvent("checking", 0));
        if (!sys.isNative || !native?.reflection) {
            this.SendEvent(new HotUpdateStateEvent("done", 1));
            this.emitProgress(2, StartupSteps[2].end);
            return false;
        }
        const bootstrap = this.GetModel(AppBootstrapModel);
        if (!bootstrap.hotUpdateUrl) {
            LogKit.I("[StartupSystem] no hot_update_url skip");
            this.SendEvent(new HotUpdateStateEvent("done", 1));
            this.emitProgress(2, StartupSteps[2].end);
            return false;
        }
        LogKit.W("[StartupSystem] native hot update pipeline not fully wired; skip in P0 scaffold");
        this.SendEvent(new HotUpdateStateEvent("done", 1));
        this.emitProgress(2, StartupSteps[2].end);
        return false;
    }
}
