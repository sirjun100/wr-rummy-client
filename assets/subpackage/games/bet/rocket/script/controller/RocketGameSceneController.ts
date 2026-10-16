import { _decorator } from "cc";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { BaseController } from "../../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

const { ccclass } = _decorator;

@ccclass("RocketGameSceneController")
export class RocketGameSceneController extends BaseController {
    protected onLoad(): void {
        LogKit.I("[RocketGameSceneController] onLoad");
    }

    public leaveTable(): void {
        this.SendCommand(new LeaveSubGameCommand());
    }
}
