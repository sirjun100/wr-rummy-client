import { _decorator } from "cc";
import { EnterSubGameCommand } from "../../../../../script/game/command/SubGameFlowCommands";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

const { ccclass } = _decorator;

@ccclass("LobbySceneController")
export class LobbySceneController extends BaseController {
    protected onLoad(): void {
        LogKit.I("[LobbySceneController] onLoad");
    }

    /** 供大厅按钮绑定：进入 Rummy */
    public enterRummy(): void {
        this.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
    }
}
