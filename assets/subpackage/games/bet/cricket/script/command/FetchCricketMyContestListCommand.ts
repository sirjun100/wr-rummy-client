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

export class FetchCricketMyContestListCommand extends AbstractCommand {
    public constructor(private readonly matchId: number) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<CricketContestListDto>(this.GetSystem(NetworkSystem), CricketRoute.MyContestList, {
            match_id: this.matchId,
        })
            .then((data) => {
                this.GetModel(CricketModel).myContestList.value = data ?? null;
            })
            .catch((e) => logCricketCommandError("MyContestList", e));
    }
}
