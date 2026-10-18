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

export class FetchCricketMatchListCommand extends AbstractCommand {
    public constructor(
        private readonly page = 1,
        private readonly sortType = 1,
        private readonly cid = "",
    ) {
        super();
    }

    protected OnExecute(): void {
        void callCricket<CricketMatchListDto>(this.GetSystem(NetworkSystem), CricketRoute.MatchList, {
            page: this.page,
            sort_type: this.sortType,
            cid: this.cid,
        })
            .then((data) => {
                const model = this.GetModel(CricketModel);
                model.allMatchList.value = data ?? null;
                model.lineUpDotIds.value = data?.act_131_dot_ids ?? [];
                this.SendEvent(new CricketListRefreshEvent());
            })
            .catch((e) => logCricketCommandError("MatchList", e));
    }
}
