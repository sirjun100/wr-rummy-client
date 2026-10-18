import { _decorator } from "cc";
import { BaseController } from "./engine/BaseController";
import { AudioSystem } from "../system/AudioSystem";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { BootstrapStartupCommand } from "../command/BootstrapStartupCommand";
import { EnterLobbyCommand } from "../command/EnterLobbyCommand";
import { LoginSuccessEvent } from "../event/LoginSuccessEvent";
import { FetchWalletSnapshotCommand } from "../commerce/command/FetchWalletSnapshotCommand";

const { ccclass } = _decorator;

@ccclass("StartController")
export class StartController extends BaseController {

    protected onLoad(): void {
        this.GetSystem(AudioSystem)
            .preloadCommon()
            .catch((err) => {
                LogKit.W(
                    "[StartController] preloadCommon failed {0}",
                    err instanceof Error ? err.message : String(err),
                );
            });

        this.RegisterEvent(LoginSuccessEvent, this.onLoginSuccess, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        this.SendCommand(new BootstrapStartupCommand());
    }

    private onLoginSuccess(): void {
        void import("../../../subpackage/function/hall/hallMenu/script/CarteModule")
            .then((carte) => {
                carte.onHallLoginSuccess();
                return import("../../../subpackage/function/social/inviteShare/script/CommShareModule");
            })
            .then((share) => {
                share.onShareLoginSuccess();
                return import("../../../subpackage/function/tableChrome/tableTheme/script/DeskModule");
            })
            .then((desk) => {
                desk?.onDeskLoginSuccess();
            });
        this.SendCommand(new FetchWalletSnapshotCommand());
        this.SendCommand(new EnterLobbyCommand());
    }
}
