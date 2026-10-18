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

export class SwitchCricketTeamCommand extends AbstractCommand {
    public constructor(
        private readonly matchId: number,
        private readonly contestId: number,
        private readonly fromTeamId: number,
        private readonly toTeamId: number,
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCricket(this.GetSystem(NetworkSystem), CricketRoute.SwitchTeam, {
            match_id: this.matchId,
            contest_id: this.contestId,
            from_team_id: this.fromTeamId,
            to_team_id: this.toTeamId,
        }).catch((e) => logCricketCommandError("SwitchTeam", e));
    }
}
