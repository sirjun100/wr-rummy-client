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

import { FetchCricketMyContestListCommand } from "./FetchCricketMyContestListCommand";
import { FetchCricketMyMatchListCommand } from "./FetchCricketMyMatchListCommand";

export class SignCricketContestCommand extends AbstractCommand {
    public constructor(
        private readonly matchId: number,
        private readonly contestId: number,
        private readonly teamId: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<CricketSignResultDto>(this.GetSystem(NetworkSystem), CricketRoute.SignContest, {
            match_id: this.matchId,
            contest_id: this.contestId,
            team_id: this.teamId,
        })
            .then(() => {
                this.SendEvent(new CricketSignSuccessEvent(this.matchId, this.contestId));
                this.SendCommand(new FetchCricketMyContestListCommand(this.matchId));
                this.SendCommand(new FetchCricketMyMatchListCommand(1));
            })
            .catch((e) => {
                logCricketCommandError("SignContest", e);
                if (isCricketMoneyLessError(e)) {
                    this.SendEvent(new CricketMoneyLessEvent());
                    void this.GetSystem(PlatformSystem).startCricketRecharge(0);
                }
            });
    }
}
