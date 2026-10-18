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

export class FetchCricketCreateTeamCheckCommand extends AbstractCommand {
    public constructor(private readonly matchId: number) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<CricketCreateTeamCheckDto>(this.GetSystem(NetworkSystem), CricketRoute.CreateTeamCheck, {
            match_id: this.matchId,
        })
            .then((data) => {
                this.GetModel(CricketModel).createTeamCheck.value = data ?? null;
            })
            .catch((e) => logCricketCommandError("CreateTeamCheck", e));
    }
}
