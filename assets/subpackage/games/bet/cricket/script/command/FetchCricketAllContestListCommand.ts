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

export class FetchCricketAllContestListCommand extends AbstractCommand {
    public constructor(
        private readonly matchId: number,
        private readonly page = 1,
    ) {
        super();
    }

    protected OnExecute(): void {
        const model = this.GetModel(CricketModel);
        model.curMatchId.value = this.matchId;
        void callCricket<CricketContestListDto>(this.GetSystem(NetworkSystem), CricketRoute.AllContestList, {
            match_id: this.matchId,
            page: this.page,
        })
            .then((data) => {
                model.allContestList.value = data ?? null;
            })
            .catch((e) => logCricketCommandError("AllContestList", e));
    }
}
