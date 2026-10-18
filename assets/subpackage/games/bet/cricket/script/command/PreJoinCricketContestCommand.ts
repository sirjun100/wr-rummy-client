import { AbstractCommand } from "../../../../../../script/framework/QFramework";
import { NetworkSystem } from "../../../../../../script/game/system/NetworkSystem";
import { PlatformSystem } from "../../../../../../script/game/system/PlatformSystem";
import {
    CricketContestListDto,
    CricketCreateTeamCheckDto,
    CricketEnterDto,
    CricketMatchListDto,
    CricketRoute,
    CricketSignResultDto,
    CricketTeamListDto,
    CricketUserTeamDto,
} from "../config/CricketProtocol";
import {
    CricketCloseCreateTeamFlowEvent,
    CricketEnterReadyEvent,
    CricketListRefreshEvent,
    CricketMoneyLessEvent,
    CricketSignSuccessEvent,
} from "../event/CricketEvents";
import { CricketModel } from "../model/CricketModel";
import { callCricket } from "../utility/CricketNetwork";
import { CricketTeamUtility } from "../utility/CricketTeamUtility";
import { isCricketMoneyLessError, logCricketCommandError } from "../utility/CricketCommandHelper";

export class PreJoinCricketContestCommand extends AbstractCommand {
    public constructor(
        private readonly matchId: number,
        private readonly contestId: number,
        private readonly teamId: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<Record<string, unknown>>(this.GetSystem(NetworkSystem), CricketRoute.PreJoinCheck, {
            match_id: this.matchId,
            contest_id: this.contestId,
            team_id: this.teamId,
        }).catch((e) => {
            logCricketCommandError("PreJoinCheck", e);
            if (isCricketMoneyLessError(e)) {
                this.SendEvent(new CricketMoneyLessEvent());
                void this.GetSystem(PlatformSystem).startCricketRecharge(0);
            }
        });
    }
}
