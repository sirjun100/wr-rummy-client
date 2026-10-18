import { _decorator, game, Game } from "cc";
import { FetchCricketMatchPushCommand } from "../command/FetchCricketMatchPushCommand";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { SubGameId } from "../../../../../../script/game/config/BundleManifest";
import { BaseController } from "../../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { CricketEnterCommand } from "../command/CricketEnterCommand";
import { CricketLeaveCommand } from "../command/CricketLeaveCommand";
import { ensureCricketRegistered, openCricketMainView } from "../CricketGameModule";

const { ccclass } = _decorator;

@ccclass("CricketGameSceneController")
export class CricketGameSceneController extends BaseController {
    private pushTimer: ReturnType<typeof setInterval> | null = null;

    protected onLoad(): void {
        ensureCricketRegistered();
        LogKit.I("[CricketGameSceneController] onLoad");
        this.SendCommand(new CricketEnterCommand());
        void openCricketMainView();
        this.pushTimer = setInterval(() => {
            this.SendCommand(new FetchCricketMatchPushCommand(0));
        }, 30000);
        game.on(Game.EVENT_SHOW, this.onForeground, this);
    }

    protected onDestroy(): void {
        if (this.pushTimer != null) {
            clearInterval(this.pushTimer);
            this.pushTimer = null;
        }
        game.off(Game.EVENT_SHOW, this.onForeground, this);
    }

    private onForeground(): void {
        this.SendCommand(new FetchCricketMatchPushCommand(0));
    }

    public leaveTable(): void {
        this.SendCommand(new CricketLeaveCommand());
        this.SendCommand(new LeaveSubGameCommand());
    }

    public onHelpClick(): void {
        void import("../../../../function/tableChrome/gameRules/script/RegularModule").then((m) =>
            m.openInGameHelpForSubGame(SubGameId.Cricket, true),
        );
    }
}
