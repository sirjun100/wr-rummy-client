import { _decorator, game, Game } from "cc";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { SubGameId } from "../../../../../../script/game/config/BundleManifest";
import { BaseController } from "../../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { RocketModel } from "../model/RocketModel";
import { ensureRocketRegistered } from "../RocketGameModule";
import { RocketSubscribePushCommand } from "../command/RocketSubscribePushCommand";
import { RocketEnterHallCommand } from "../command/RocketEnterHallCommand";
import { RocketSyncTableCommand } from "../command/RocketSyncTableCommand";
import { bootstrapRocketScene } from "../utility/RocketSceneBootstrap";

const { ccclass } = _decorator;

@ccclass("RocketGameSceneController")
export class RocketGameSceneController extends BaseController {
    private backgroundAt = 0;

    protected onLoad(): void {
        LogKit.I("[RocketGameSceneController] onLoad");
        ensureRocketRegistered();
        bootstrapRocketScene(this.node);
        this.SendCommand(new RocketSubscribePushCommand());
        const model = this.GetModel(RocketModel);
        const tid = model.templateId || "default";
        this.SendCommand(new RocketEnterHallCommand(tid));
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
        if (gap > 30000 || gap === 0) {
            this.SendCommand(new RocketSyncTableCommand(true));
        } else {
            this.SendCommand(new RocketSyncTableCommand(true));
        }
    }

    public leaveTable(): void {
        this.SendCommand(new LeaveSubGameCommand());
    }

    /** Bind from scene help control → bootstrap `game_help.rocket`. */
    public onHelpClick(): void {
        void import("../../../../function/tableChrome/gameRules/script/RegularModule").then((m) =>
            m.openInGameHelpForSubGame(SubGameId.Rocket, true),
        );
    }
}
