import { _decorator, game, Game } from "cc";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { SubGameId } from "../../../../../../script/game/config/BundleManifest";
import { BaseController } from "../../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { SixpointEnterHallCommand } from "../command/SixpointEnterHallCommand";
import { SixpointSubscribePushCommand } from "../command/SixpointSubscribePushCommand";
import { SixpointSyncTableCommand } from "../command/SixpointSyncTableCommand";
import { SixpointModel } from "../model/SixpointModel";
import { ensureSixpointRegistered } from "../SixpointGameModule";
import { bootstrapSixpointScene } from "../utility/SixpointSceneBootstrap";

const { ccclass } = _decorator;

@ccclass("SixpointGameSceneController")
export class SixpointGameSceneController extends BaseController {
    private backgroundAt = 0;

    protected onLoad(): void {
        LogKit.I("[SixpointGameSceneController] onLoad");
        ensureSixpointRegistered();
        bootstrapSixpointScene(this.node);
        this.SendCommand(new SixpointSubscribePushCommand());
        const model = this.GetModel(SixpointModel);
        const tid = model.templateId || "default";
        this.SendCommand(new SixpointEnterHallCommand(tid));
        game.on(Game.EVENT_SHOW, this.onForeground, this);
        game.on(Game.EVENT_HIDE, this.onBackground, this);
    }

    protected onDestroy(): void {
        game.off(Game.EVENT_SHOW, this.onForeground, this);
        game.off(Game.EVENT_HIDE, this.onBackground, this);
    }

    private onBackground(): void {
        this.backgroundAt = Date.now();
    }

    private onForeground(): void {
        const gap = Date.now() - this.backgroundAt;
        if (gap > 30000 || this.backgroundAt === 0) {
            this.SendCommand(new SixpointSyncTableCommand());
        }
    }

    public leaveTable(): void {
        this.SendCommand(new LeaveSubGameCommand());
    }

    public onHelpClick(): void {
        void import("../../../../function/tableChrome/gameRules/script/RegularModule").then((m) =>
            m.openInGameHelpForSubGame(SubGameId.Sixpoint, true),
        );
    }
}
